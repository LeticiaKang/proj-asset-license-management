package com.assetmanagement.asset.repository;

import com.assetmanagement.asset.entity.AssetHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetHistoryRepository extends JpaRepository<AssetHistory, Long> {

    List<AssetHistory> findByAssetIdOrderByActionDateDesc(Long assetId);
}
