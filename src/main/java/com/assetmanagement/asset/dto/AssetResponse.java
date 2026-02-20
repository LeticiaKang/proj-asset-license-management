package com.assetmanagement.asset.dto;

import com.assetmanagement.asset.entity.Asset;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Builder
public class AssetResponse {

    private Long assetId;
    private Long categoryId;
    private String categoryName;
    private String assetName;
    private String manufacturer;
    private String modelName;
    private String serialNumber;
    private LocalDate purchaseDate;
    private BigDecimal purchasePrice;
    private LocalDate warrantyStartDate;
    private LocalDate warrantyEndDate;
    private String assetStatus;
    private String memory;
    private String storage;
    private Map<String, Object> specs;
    private String remarks;
    private LocalDateTime regDate;

    public static AssetResponse from(Asset asset) {
        return AssetResponse.builder()
            .assetId(asset.getAssetId())
            .categoryId(asset.getCategory().getCategoryId())
            .categoryName(asset.getCategory().getCategoryName())
            .assetName(asset.getAssetName())
            .manufacturer(asset.getManufacturer())
            .modelName(asset.getModelName())
            .serialNumber(asset.getSerialNumber())
            .purchaseDate(asset.getPurchaseDate())
            .purchasePrice(asset.getPurchasePrice())
            .warrantyStartDate(asset.getWarrantyStartDate())
            .warrantyEndDate(asset.getWarrantyEndDate())
            .assetStatus(asset.getAssetStatus())
            .memory(asset.getMemory())
            .storage(asset.getStorage())
            .specs(asset.getSpecs())
            .remarks(asset.getRemarks())
            .regDate(asset.getRegDate())
            .build();
    }
}
