package com.assetmanagement.license.service;

import com.assetmanagement.asset.entity.AssetAssignment;
import com.assetmanagement.asset.repository.AssetAssignmentRepository;
import com.assetmanagement.global.exception.BusinessException;
import com.assetmanagement.global.exception.ErrorCode;
import com.assetmanagement.global.util.RedisLockUtil;
import com.assetmanagement.license.dto.LicenseAssignmentRequest;
import com.assetmanagement.license.dto.LicenseAssignmentResponse;
import com.assetmanagement.license.dto.LicenseReturnRequest;
import com.assetmanagement.license.entity.License;
import com.assetmanagement.license.entity.LicenseAssignment;
import com.assetmanagement.license.entity.LicenseHistory;
import com.assetmanagement.license.entity.LicenseKey;
import com.assetmanagement.license.repository.LicenseAssignmentRepository;
import com.assetmanagement.license.repository.LicenseHistoryRepository;
import com.assetmanagement.license.repository.LicenseKeyRepository;
import com.assetmanagement.license.repository.LicenseRepository;
import com.assetmanagement.member.dto.MemberAssignmentDetailResponse;
import com.assetmanagement.member.entity.Member;
import com.assetmanagement.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LicenseAssignmentService {

    private final LicenseRepository licenseRepository;
    private final LicenseKeyRepository licenseKeyRepository;
    private final LicenseAssignmentRepository licenseAssignmentRepository;
    private final LicenseHistoryRepository licenseHistoryRepository;
    private final MemberRepository memberRepository;
    private final AssetAssignmentRepository assetAssignmentRepository;
    private final RedisLockUtil redisLockUtil;

    private static final int MAX_RETRY = 3;
    private static final long RETRY_INTERVAL_MS = 100;

    public Page<LicenseAssignmentResponse> getAssignments(Pageable pageable) {
        Specification<LicenseAssignment> spec = (root, query, cb) ->
            cb.isFalse(root.get("isDeleted"));
        return licenseAssignmentRepository.findAll(spec, pageable)
            .map(LicenseAssignmentResponse::from);
    }

    public MemberAssignmentDetailResponse getMemberAssignmentDetail(Long memberId) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));

        List<AssetAssignment> assetAssignments =
            assetAssignmentRepository.findByMember_MemberIdAndAssignmentStatusAndIsDeletedFalse(
                memberId, "ASSIGNED");

        List<LicenseAssignment> licenseAssignments =
            licenseAssignmentRepository.findByMember_MemberIdAndAssignmentStatusAndIsDeletedFalse(
                memberId, "ASSIGNED");

        return buildMemberDetail(member, assetAssignments, licenseAssignments);
    }

    @Transactional
    public LicenseAssignmentResponse assignLicense(LicenseAssignmentRequest request, Long regId) {
        String lockKey = "license:assign:" + request.getLicenseId();

        if (!tryAcquireLock(lockKey)) {
            throw new BusinessException(ErrorCode.COMMON_001);
        }

        try {
            License license = licenseRepository.findByLicenseIdAndIsDeletedFalse(request.getLicenseId())
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));

            Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));

            // 수량 체크: used_qty < total_qty
            if (license.getUsedQty() >= license.getTotalQty()) {
                throw new BusinessException(ErrorCode.LICENSE_001);
            }

            // SUBSCRIPTION 유형: 만료일 확인
            if ("SUBSCRIPTION".equals(license.getLicenseType()) && license.isExpired()) {
                throw new BusinessException(ErrorCode.LICENSE_003);
            }

            // 동일 사용자 중복 배정 체크
            licenseAssignmentRepository
                .findByLicense_LicenseIdAndMember_MemberIdAndAssignmentStatusAndIsDeletedFalse(
                    request.getLicenseId(), request.getMemberId(), "ASSIGNED")
                .ifPresent(a -> { throw new BusinessException(ErrorCode.LICENSE_002); });

            // INDIVIDUAL 유형: keyId 필수, 키 상태 AVAILABLE 확인
            LicenseKey licenseKey = null;
            if ("INDIVIDUAL".equals(license.getLicenseType())) {
                if (request.getKeyId() == null) {
                    throw new BusinessException(ErrorCode.LICENSE_005);
                }
                licenseKey = licenseKeyRepository.findById(request.getKeyId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));
                if (!"AVAILABLE".equals(licenseKey.getKeyStatus())) {
                    throw new BusinessException(ErrorCode.LICENSE_006);
                }
                licenseKey.changeStatus("IN_USE");
            } else if (request.getKeyId() != null) {
                // VOLUME/SUBSCRIPTION도 keyId가 있으면 상태 변경
                licenseKey = licenseKeyRepository.findById(request.getKeyId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));
                if (!"AVAILABLE".equals(licenseKey.getKeyStatus())) {
                    throw new BusinessException(ErrorCode.LICENSE_006);
                }
                licenseKey.changeStatus("IN_USE");
            }

            // 배정 레코드 생성 (INSERT 시 트리거가 used_qty 자동 증가)
            LicenseAssignment assignment = LicenseAssignment.builder()
                .license(license)
                .licenseKey(licenseKey)
                .member(member)
                .assignedDate(request.getAssignedDate())
                .assignmentReason(request.getAssignmentReason())
                .remarks(request.getRemarks())
                .build();
            assignment.setRegId(regId);
            assignment.setUpdId(regId);

            licenseAssignmentRepository.save(assignment);

            // 이력 기록
            saveHistory(license.getLicenseId(),
                licenseKey != null ? licenseKey.getKeyId() : null,
                member.getMemberId(), "ASSIGN", request.getAssignmentReason(),
                request.getRemarks(), regId);

            return LicenseAssignmentResponse.from(assignment);
        } finally {
            redisLockUtil.unlock(lockKey);
        }
    }

    @Transactional
    public void returnLicense(Long assignmentId, LicenseReturnRequest request, Long updId) {
        LicenseAssignment assignment = licenseAssignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));

        if (!"ASSIGNED".equals(assignment.getAssignmentStatus())) {
            throw new BusinessException(ErrorCode.LICENSE_004, "배정 상태인 건만 회수할 수 있습니다.");
        }

        // 배정 상태 변경 (UPDATE 시 트리거가 used_qty 자동 감소)
        assignment.returnLicense();
        assignment.setUpdId(updId);

        // 키 상태 AVAILABLE로 변경
        if (assignment.getLicenseKey() != null) {
            assignment.getLicenseKey().changeStatus("AVAILABLE");
        }

        // 이력 기록
        saveHistory(assignment.getLicense().getLicenseId(),
            assignment.getLicenseKey() != null ? assignment.getLicenseKey().getKeyId() : null,
            assignment.getMember().getMemberId(), "RETURN", null,
            request != null ? request.getRemarks() : null, updId);
    }

    @Transactional
    public LicenseAssignmentResponse updateAssignment(Long assignmentId,
            LicenseAssignmentRequest request, Long updId) {
        LicenseAssignment assignment = licenseAssignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));

        LicenseAssignment updated = LicenseAssignment.builder()
            .assignmentId(assignment.getAssignmentId())
            .license(assignment.getLicense())
            .licenseKey(assignment.getLicenseKey())
            .member(assignment.getMember())
            .assignedDate(assignment.getAssignedDate())
            .returnDate(assignment.getReturnDate())
            .assignmentReason(request.getAssignmentReason())
            .assignmentStatus(assignment.getAssignmentStatus())
            .remarks(request.getRemarks())
            .build();
        updated.setUpdId(updId);

        return LicenseAssignmentResponse.from(licenseAssignmentRepository.save(updated));
    }

    private void saveHistory(Long licenseId, Long keyId, Long memberId,
                             String actionType, String assignmentReason,
                             String remarks, Long regId) {
        LicenseHistory history = LicenseHistory.builder()
            .licenseId(licenseId)
            .keyId(keyId)
            .memberId(memberId)
            .actionType(actionType)
            .assignmentReason(assignmentReason)
            .remarks(remarks)
            .build();
        history.setRegId(regId);
        licenseHistoryRepository.save(history);
    }

    private boolean tryAcquireLock(String lockKey) {
        for (int i = 0; i < MAX_RETRY; i++) {
            if (redisLockUtil.tryLock(lockKey, Duration.ofSeconds(30))) {
                return true;
            }
            try {
                Thread.sleep(RETRY_INTERVAL_MS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false;
            }
        }
        return false;
    }

    private MemberAssignmentDetailResponse buildMemberDetail(
            Member member,
            List<AssetAssignment> assetAssignments,
            List<LicenseAssignment> licenseAssignments) {

        MemberAssignmentDetailResponse.UserInfo userInfo =
            MemberAssignmentDetailResponse.UserInfo.builder()
                .memberId(member.getMemberId())
                .memberName(member.getMemberName())
                .loginId(member.getLoginId())
                .deptId(member.getDeptId())
                .hireDate(member.getHireDate())
                .resignDate(member.getResignDate())
                .build();

        List<MemberAssignmentDetailResponse.AssetAssignmentItem> assetItems =
            assetAssignments.stream()
                .map(a -> MemberAssignmentDetailResponse.AssetAssignmentItem.builder()
                    .assignmentId(a.getAssignmentId())
                    .categoryName(a.getAsset().getCategory().getCategoryName())
                    .assetName(a.getAsset().getAssetName())
                    .manufacturer(a.getAsset().getManufacturer())
                    .modelName(a.getAsset().getModelName())
                    .assignedDate(a.getAssignedDate())
                    .build())
                .toList();

        List<MemberAssignmentDetailResponse.LicenseAssignmentItem> licenseItems =
            licenseAssignments.stream()
                .map(la -> MemberAssignmentDetailResponse.LicenseAssignmentItem.builder()
                    .assignmentId(la.getAssignmentId())
                    .softwareName(la.getLicense().getSoftware().getSoftwareName())
                    .licenseVersion(la.getLicense().getLicenseVersion())
                    .licenseType(la.getLicense().getLicenseType())
                    .assignedDate(la.getAssignedDate())
                    .assignmentReason(la.getAssignmentReason())
                    .build())
                .toList();

        return MemberAssignmentDetailResponse.builder()
            .userInfo(userInfo)
            .assetAssignments(assetItems)
            .licenseAssignments(licenseItems)
            .build();
    }
}
