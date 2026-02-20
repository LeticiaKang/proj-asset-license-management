package com.assetmanagement.asset.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AssetCategoryRequest {

    @NotBlank(message = "카테고리명은 필수입니다.")
    private String categoryName;

    @NotBlank(message = "카테고리 코드는 필수입니다.")
    private String categoryCode;

    private Long parentCategoryId;

    private Integer categoryOrder;
}
