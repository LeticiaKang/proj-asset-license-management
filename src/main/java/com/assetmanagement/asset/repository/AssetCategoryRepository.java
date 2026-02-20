package com.assetmanagement.asset.repository;

import com.assetmanagement.asset.entity.AssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetCategoryRepository extends JpaRepository<AssetCategory, Long> {

    List<AssetCategory> findByIsDeletedFalseAndIsActiveTrueOrderByCategoryOrder();
}
