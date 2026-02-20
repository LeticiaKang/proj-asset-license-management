package com.assetmanagement.asset.repository;

import com.assetmanagement.asset.dto.AssetSearchCondition;
import com.assetmanagement.asset.entity.Asset;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class AssetSpecification {

    public static Specification<Asset> search(AssetSearchCondition cond) {
        return Specification.where(notDeleted())
            .and(keywordContains(cond.getKeyword()))
            .and(categoryEquals(cond.getCategoryId()))
            .and(statusEquals(cond.getAssetStatus()));
    }

    private static Specification<Asset> notDeleted() {
        return (root, query, cb) -> cb.isFalse(root.get("isDeleted"));
    }

    private static Specification<Asset> keywordContains(String keyword) {
        if (!StringUtils.hasText(keyword)) return null;
        return (root, query, cb) -> cb.or(
            cb.like(cb.lower(root.get("assetName")), "%" + keyword.toLowerCase() + "%"),
            cb.like(cb.lower(root.get("serialNumber")), "%" + keyword.toLowerCase() + "%"),
            cb.like(cb.lower(root.get("modelName")), "%" + keyword.toLowerCase() + "%")
        );
    }

    private static Specification<Asset> categoryEquals(Long categoryId) {
        if (categoryId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("category").get("categoryId"), categoryId);
    }

    private static Specification<Asset> statusEquals(String assetStatus) {
        if (!StringUtils.hasText(assetStatus)) return null;
        return (root, query, cb) -> cb.equal(root.get("assetStatus"), assetStatus);
    }
}
