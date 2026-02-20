package com.assetmanagement.asset.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AssetSummaryResponse {

    private Long categoryId;
    private String categoryName;
    private String categoryCode;
    private Long totalCount;
    private Long availableCount;
    private Long inUseCount;
    private Long repairCount;
    private Long disposedCount;
    private Long lostCount;
}
