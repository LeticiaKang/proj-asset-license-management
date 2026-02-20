package com.assetmanagement.asset.repository;

import com.assetmanagement.asset.entity.AssetAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, Long>,
        JpaSpecificationExecutor<AssetAssignment> {

    Optional<AssetAssignment> findByAsset_AssetIdAndAssignmentStatusAndIsDeletedFalse(
            Long assetId, String assignmentStatus);

    List<AssetAssignment> findByMember_MemberIdAndAssignmentStatusAndIsDeletedFalse(
            Long memberId, String assignmentStatus);
}
