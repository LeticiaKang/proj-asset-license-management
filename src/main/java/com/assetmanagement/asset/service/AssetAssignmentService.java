package com.assetmanagement.asset.service;

import com.assetmanagement.asset.dto.*;
import com.assetmanagement.asset.entity.Asset;
import com.assetmanagement.asset.entity.AssetAssignment;
import com.assetmanagement.asset.entity.AssetHistory;
import com.assetmanagement.asset.repository.AssetAssignmentRepository;
import com.assetmanagement.asset.repository.AssetHistoryRepository;
import com.assetmanagement.asset.repository.AssetRepository;
import com.assetmanagement.global.exception.BusinessException;
import com.assetmanagement.global.exception.ErrorCode;
import com.assetmanagement.global.util.RedisLockUtil;
import com.assetmanagement.license.entity.LicenseAssignment;
import com.assetmanagement.license.repository.LicenseAssignmentRepository;
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
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AssetAssignmentService {

    private final AssetRepository assetRepository;
    private final AssetAssignmentRepository assetAssignmentRepository;
    private final AssetHistoryRepository assetHistoryRepository;
    private final MemberRepository memberRepository;
    private final LicenseAssignmentRepository licenseAssignmentRepository;
    private final RedisLockUtil redisLockUtil;
    private final AssetService assetService;

    private static final int MAX_RETRY = 3;
    private static final long RETRY_INTERVAL_MS = 100;

    public Page<AssetAssignmentResponse> getAssignments(Pageable pageable) {
        Specification<AssetAssignment> spec = (root, query, cb) ->
            cb.isFalse(root.get("isDeleted"));
        return assetAssignmentRepository.findAll(spec, pageable)
            .map(AssetAssignmentResponse::from);
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
    public AssetAssignmentResponse assignAsset(AssetAssignmentRequest request, Long regId) {
        String lockKey = "asset:assign:" + request.getAssetId();

        if (!tryAcquireLock(lockKey)) {
            throw new BusinessException(ErrorCode.COMMON_001);
        }

        try {
            Asset asset = assetRepository.findByAssetIdAndIsDeletedFalse(request.getAssetId())
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));

            // AVAILABLE 상태인지 확인
            if (!"AVAILABLE".equals(asset.getAssetStatus())) {
                throw new BusinessException(ErrorCode.ASSET_001,
                    "AVAILABLE 상태인 자산만 배정할 수 있습니다. 현재 상태: " + asset.getAssetStatus());
            }

            // 이미 배정된 자산인지 확인
            assetAssignmentRepository
                .findByAsset_AssetIdAndAssignmentStatusAndIsDeletedFalse(
                    request.getAssetId(), "ASSIGNED")
                .ifPresent(a -> { throw new BusinessException(ErrorCode.ASSET_002); });

            Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));

            // 자산 상태 변경
            asset.changeStatus("IN_USE");

            // 배정 레코드 생성
            AssetAssignment assignment = AssetAssignment.builder()
                .asset(asset)
                .member(member)
                .assignedDate(request.getAssignedDate())
                .remarks(request.getRemarks())
                .build();
            assignment.setRegId(regId);
            assignment.setUpdId(regId);

            assetAssignmentRepository.save(assignment);

            // 이력 기록
            saveHistory(asset.getAssetId(), member.getMemberId(), "ASSIGN",
                request.getRemarks(), regId);

            return AssetAssignmentResponse.from(assignment);
        } finally {
            redisLockUtil.unlock(lockKey);
        }
    }

    @Transactional
    public void returnAsset(Long assignmentId, AssetReturnRequest request, Long updId) {
        AssetAssignment assignment = assetAssignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));

        if (!"ASSIGNED".equals(assignment.getAssignmentStatus())) {
            throw new BusinessException(ErrorCode.ASSET_001, "배정 상태인 건만 반납할 수 있습니다.");
        }

        // 배정 상태 변경
        assignment.returnAsset();
        if (request.getReturnDate() != null) {
            // 직접 반납일 지정
            AssetAssignment updated = AssetAssignment.builder()
                .assignmentId(assignment.getAssignmentId())
                .asset(assignment.getAsset())
                .member(assignment.getMember())
                .assignedDate(assignment.getAssignedDate())
                .returnDate(request.getReturnDate())
                .assignmentStatus("RETURNED")
                .remarks(request.getRemarks())
                .build();
            updated.setUpdId(updId);
            assetAssignmentRepository.save(updated);
        } else {
            assignment.setUpdId(updId);
        }

        // 자산 상태 AVAILABLE로 변경
        assignment.getAsset().changeStatus("AVAILABLE");

        // 이력 기록
        saveHistory(assignment.getAsset().getAssetId(),
            assignment.getMember().getMemberId(), "RETURN", request.getRemarks(), updId);
    }

    @Transactional
    public void transferAsset(Long assignmentId, AssetTransferRequest request, Long updId) {
        AssetAssignment currentAssignment = assetAssignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));

        if (!"ASSIGNED".equals(currentAssignment.getAssignmentStatus())) {
            throw new BusinessException(ErrorCode.ASSET_001, "배정 상태인 건만 이관할 수 있습니다.");
        }

        Member newMember = memberRepository.findById(request.getNewMemberId())
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));

        Asset asset = currentAssignment.getAsset();

        // 기존 배정 반납 처리
        currentAssignment.returnAsset();
        currentAssignment.setUpdId(updId);

        // 이력 - 기존 사용자 반납
        saveHistory(asset.getAssetId(), currentAssignment.getMember().getMemberId(),
            "TRANSFER", "이관: " + request.getRemarks(), updId);

        // 신규 배정 생성
        AssetAssignment newAssignment = AssetAssignment.builder()
            .asset(asset)
            .member(newMember)
            .assignedDate(LocalDate.now())
            .remarks(request.getRemarks())
            .build();
        newAssignment.setRegId(updId);
        newAssignment.setUpdId(updId);

        assetAssignmentRepository.save(newAssignment);

        // 이력 - 신규 사용자 배정
        saveHistory(asset.getAssetId(), newMember.getMemberId(),
            "ASSIGN", "이관: " + request.getRemarks(), updId);
    }

    private void saveHistory(Long assetId, Long memberId, String actionType,
                             String remarks, Long regId) {
        AssetHistory history = AssetHistory.builder()
            .assetId(assetId)
            .memberId(memberId)
            .actionType(actionType)
            .remarks(remarks)
            .build();
        history.setRegId(regId);
        assetHistoryRepository.save(history);
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
