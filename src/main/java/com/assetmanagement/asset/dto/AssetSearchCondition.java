package com.assetmanagement.asset.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssetSearchCondition {

    private String keyword;
    private Long categoryId;
    private String assetStatus;
}
