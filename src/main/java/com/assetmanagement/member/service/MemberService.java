package com.assetmanagement.member.service;

import com.assetmanagement.asset.entity.Asset;
import com.assetmanagement.asset.entity.AssetAssignment;
import com.assetmanagement.asset.entity.AssetHistory;
import com.assetmanagement.asset.repository.AssetAssignmentRepository;
import com.assetmanagement.asset.repository.AssetHistoryRepository;
import com.assetmanagement.global.exception.BusinessException;
import com.assetmanagement.global.exception.ErrorCode;
import com.assetmanagement.license.entity.LicenseAssignment;
import com.assetmanagement.license.entity.LicenseHistory;
import com.assetmanagement.license.repository.LicenseAssignmentRepository;
import com.assetmanagement.license.repository.LicenseHistoryRepository;
import com.assetmanagement.member.dto.*;
import com.assetmanagement.member.entity.Member;
import com.assetmanagement.member.entity.MemberRole;
import com.assetmanagement.member.repository.MemberRepository;
import com.assetmanagement.member.repository.MemberRoleRepository;
import com.assetmanagement.member.repository.MemberSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;
    private final MemberRoleRepository memberRoleRepository;
    private final AssetAssignmentRepository assetAssignmentRepository;
    private final AssetHistoryRepository assetHistoryRepository;
    private final LicenseAssignmentRepository licenseAssignmentRepository;
    private final LicenseHistoryRepository licenseHistoryRepository;
    private final StringRedisTemplate redisTemplate;
    private final PasswordEncoder passwordEncoder;

    private static final String RESIGN_REMARKS = "퇴사로 인한 자동 회수";

    public Page<MemberResponse> getMembers(MemberSearchCondition condition, Pageable pageable) {
        return memberRepository.findAll(MemberSpecification.search(condition), pageable)
            .map(MemberResponse::from);
    }

    public MemberResponse getMember(Long memberId) {
        Member member = findMemberOrThrow(memberId);
        return MemberResponse.from(member);
    }

    @Transactional
    public MemberResponse createMember(MemberRequest request, Long regId) {
        if (memberRepository.existsByLoginId(request.getLoginId())) {
            throw new BusinessException(ErrorCode.USER_001);
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        Member member = request.toEntity(encodedPassword);
        member.setRegId(regId);
        member.setUpdId(regId);

        return MemberResponse.from(memberRepository.save(member));
    }

    @Transactional
    public MemberResponse updateMember(Long memberId, MemberRequest request, Long updId) {
        Member existing = findMemberOrThrow(memberId);

        Member updated = Member.builder()
            .memberId(existing.getMemberId())
            .loginId(existing.getLoginId())
            .password(existing.getPassword())
            .memberName(request.getMemberName())
            .deptId(request.getDeptId())
            .position(request.getPosition())
            .jobTitle(request.getJobTitle())
            .hireDate(request.getHireDate())
            .resignDate(existing.getResignDate())
            .employmentStatus(existing.getEmploymentStatus())
            .workLocation(request.getWorkLocation())
            .email(request.getEmail())
            .phone(request.getPhone())
            .loginFailCount(existing.getLoginFailCount())
            .isLocked(existing.getIsLocked())
            .passwordChangedAt(existing.getPasswordChangedAt())
            .isInitialPassword(existing.getIsInitialPassword())
            .isActive(existing.getIsActive())
            .build();

        updated.setUpdId(updId);
        return MemberResponse.from(memberRepository.save(updated));
    }

    @Transactional
    public void deleteMember(Long memberId, Long updId) {
        Member member = findMemberOrThrow(memberId);
        member.softDelete(updId);
    }

    public List<MemberRoleResponse> getMemberRoles(Long memberId) {
        findMemberOrThrow(memberId);
        return memberRoleRepository.findByMember_MemberIdAndIsDeletedFalse(memberId).stream()
            .map(MemberRoleResponse::from)
            .toList();
    }

    @Transactional
    public List<MemberRoleResponse> updateMemberRoles(Long memberId, MemberRoleRequest request, Long updId) {
        Member member = findMemberOrThrow(memberId);

        // 기존 매핑 소프트 삭제
        List<MemberRole> existing = memberRoleRepository.findByMember_MemberIdAndIsDeletedFalse(memberId);
        for (MemberRole mr : existing) {
            mr.softDelete(updId);
        }

        // 새 매핑 생성
        List<MemberRole> newRoles = request.getRoleIds().stream()
            .map(roleId -> {
                MemberRole mr = MemberRole.builder()
                    .member(member)
                    .roleId(roleId)
                    .build();
                mr.setRegId(updId);
                mr.setUpdId(updId);
                return mr;
            })
            .toList();

        return memberRoleRepository.saveAll(newRoles).stream()
            .map(MemberRoleResponse::from)
            .toList();
    }

    private Member findMemberOrThrow(Long memberId) {
        return memberRepository.findByMemberIdAndIsDeletedFalse(memberId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));
    }

    /**
     * 퇴사 처리 7단계 프로세스 (system-policy.md 섹션 4.3)
     *
     * 1. resign_date 기록
     * 2. employment_status → RESIGNED
     * 3. 배정된 모든 자산 자동 반납
     * 4. 배정된 모든 라이센스 자동 회수
     * 5. 각 회수 건 이력 자동 기록 (3,4단계에서 함께 처리)
     * 6. 사용자 계정 비활성화 (is_active = false)
     * 7. Redis 세션 삭제 (즉시 로그아웃)
     */
    @Transactional
    public void resignMember(Long memberId, LocalDate resignDate, Long updId) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));

        // Step 1 & 2: resign_date 기록 + employment_status → RESIGNED
        try {
            member.resign(resignDate);
        } catch (IllegalStateException e) {
            throw new BusinessException(ErrorCode.USER_002);
        }
        member.setUpdId(updId);

        // Step 3 & 5: 배정된 모든 자산 자동 반납 + 이력 기록
        returnAllAssets(memberId, updId);

        // Step 4 & 5: 배정된 모든 라이센스 자동 회수 + 이력 기록
        returnAllLicenses(memberId, updId);

        // Step 6: is_active = false (Member.resign()에서 이미 처리됨)

        // Step 7: Redis 세션 삭제 (즉시 로그아웃)
        deleteRedisSessions(memberId);
    }

    /**
     * 배정 중인 모든 자산을 자동 반납 처리
     */
    private void returnAllAssets(Long memberId, Long updId) {
        List<AssetAssignment> assignments =
            assetAssignmentRepository.findByMember_MemberIdAndAssignmentStatusAndIsDeletedFalse(
                memberId, "ASSIGNED");

        for (AssetAssignment assignment : assignments) {
            // 배정 상태 → RETURNED, return_date 기록
            assignment.returnAsset();
            assignment.setUpdId(updId);

            // 자산 상태 → AVAILABLE
            Asset asset = assignment.getAsset();
            asset.changeStatus("AVAILABLE");

            // 이력 기록
            AssetHistory history = AssetHistory.builder()
                .assetId(asset.getAssetId())
                .memberId(memberId)
                .actionType("RETURN")
                .remarks(RESIGN_REMARKS)
                .build();
            history.setRegId(updId);
            assetHistoryRepository.save(history);
        }
    }

    /**
     * 배정 중인 모든 라이센스를 자동 회수 처리
     */
    private void returnAllLicenses(Long memberId, Long updId) {
        List<LicenseAssignment> assignments =
            licenseAssignmentRepository.findByMember_MemberIdAndAssignmentStatusAndIsDeletedFalse(
                memberId, "ASSIGNED");

        for (LicenseAssignment assignment : assignments) {
            // 배정 상태 → RETURNED, return_date 기록
            assignment.returnLicense();
            assignment.setUpdId(updId);

            // 키 상태 → AVAILABLE (키가 있는 경우)
            if (assignment.getLicenseKey() != null) {
                assignment.getLicenseKey().changeStatus("AVAILABLE");
            }

            // 이력 기록
            LicenseHistory history = LicenseHistory.builder()
                .licenseId(assignment.getLicense().getLicenseId())
                .keyId(assignment.getLicenseKey() != null
                    ? assignment.getLicenseKey().getKeyId() : null)
                .memberId(memberId)
                .actionType("RETURN")
                .remarks(RESIGN_REMARKS)
                .build();
            history.setRegId(updId);
            licenseHistoryRepository.save(history);
        }
    }

    /**
     * Redis에 저장된 해당 사용자의 세션/토큰 삭제
     */
    private void deleteRedisSessions(Long memberId) {
        Set<String> keys = redisTemplate.keys("refresh:member:" + memberId + ":*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
}
