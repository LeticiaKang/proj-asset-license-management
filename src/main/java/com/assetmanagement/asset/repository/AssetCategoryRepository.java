package com.assetmanagement.asset.repository;

import com.assetmanagement.asset.entity.AssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssetCategoryRepository extends JpaRepository<AssetCategory, Long> {

    List<AssetCategory> findByIsDeletedFalseAndIsActiveTrueOrderByCategoryOrder();

    Optional<AssetCategory> findByCategoryIdAndIsDeletedFalse(Long categoryId);

    boolean existsByParentCategory_CategoryIdAndIsDeletedFalse(Long parentCategoryId);
}
