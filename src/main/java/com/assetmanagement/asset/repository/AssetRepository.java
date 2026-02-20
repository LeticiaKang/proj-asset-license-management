package com.assetmanagement.asset.repository;

import com.assetmanagement.asset.dto.AssetSummaryResponse;
import com.assetmanagement.asset.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {

    Optional<Asset> findByAssetIdAndIsDeletedFalse(Long assetId);

    boolean existsBySerialNumber(String serialNumber);

    @Query("""
        SELECT new com.assetmanagement.asset.dto.AssetSummaryResponse(
            ac.categoryId, ac.categoryName, ac.categoryCode,
            COUNT(a.assetId),
            COUNT(CASE WHEN a.assetStatus = 'AVAILABLE' THEN 1 END),
            COUNT(CASE WHEN a.assetStatus = 'IN_USE' THEN 1 END),
            COUNT(CASE WHEN a.assetStatus = 'REPAIR' THEN 1 END),
            COUNT(CASE WHEN a.assetStatus = 'DISPOSED' THEN 1 END),
            COUNT(CASE WHEN a.assetStatus = 'LOST' THEN 1 END)
        )
        FROM AssetCategory ac
        LEFT JOIN Asset a ON a.category = ac AND a.isDeleted = false
        WHERE ac.isDeleted = false
        GROUP BY ac.categoryId, ac.categoryName, ac.categoryCode, ac.categoryOrder
        ORDER BY ac.categoryOrder
        """)
    List<AssetSummaryResponse> getAssetSummary();
}
