package com.assetmanagement.asset.dto;

import com.assetmanagement.asset.entity.AssetCategory;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AssetCategoryResponse {

    private Long categoryId;
    private String categoryName;
    private String categoryCode;
    private Long parentCategoryId;
    private Integer categoryOrder;
    private Boolean isActive;

    public static AssetCategoryResponse from(AssetCategory category) {
        return AssetCategoryResponse.builder()
            .categoryId(category.getCategoryId())
            .categoryName(category.getCategoryName())
            .categoryCode(category.getCategoryCode())
            .parentCategoryId(
                category.getParentCategory() != null
                    ? category.getParentCategory().getCategoryId()
                    : null)
            .categoryOrder(category.getCategoryOrder())
            .isActive(category.getIsActive())
            .build();
    }
}
