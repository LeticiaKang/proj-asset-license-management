package com.assetmanagement.license.repository;

import com.assetmanagement.license.entity.LicenseAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface LicenseAssignmentRepository extends JpaRepository<LicenseAssignment, Long>,
        JpaSpecificationExecutor<LicenseAssignment> {

    Optional<LicenseAssignment> findByLicense_LicenseIdAndMember_MemberIdAndAssignmentStatusAndIsDeletedFalse(
            Long licenseId, Long memberId, String assignmentStatus);

    List<LicenseAssignment> findByMember_MemberIdAndAssignmentStatusAndIsDeletedFalse(
            Long memberId, String assignmentStatus);

    List<LicenseAssignment> findByLicense_LicenseIdAndAssignmentStatusAndIsDeletedFalse(
            Long licenseId, String assignmentStatus);
}
