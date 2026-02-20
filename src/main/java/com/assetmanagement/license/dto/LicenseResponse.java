package com.assetmanagement.license.dto;

import com.assetmanagement.license.entity.License;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class LicenseResponse {

    private Long licenseId;
    private Long softwareId;
    private String softwareName;
    private String licenseType;
    private String licenseVersion;
    private Integer totalQty;
    private Integer usedQty;
    private Integer remainQty;
    private LocalDate purchaseDate;
    private LocalDate expiryDate;
    private BigDecimal purchasePrice;
    private String installGuide;
    private String remarks;
    private Boolean isActive;
    private LocalDateTime regDate;

    public static LicenseResponse from(License license) {
        return LicenseResponse.builder()
            .licenseId(license.getLicenseId())
            .softwareId(license.getSoftware().getSoftwareId())
            .softwareName(license.getSoftware().getSoftwareName())
            .licenseType(license.getLicenseType())
            .licenseVersion(license.getLicenseVersion())
            .totalQty(license.getTotalQty())
            .usedQty(license.getUsedQty())
            .remainQty(license.getRemainQty())
            .purchaseDate(license.getPurchaseDate())
            .expiryDate(license.getExpiryDate())
            .purchasePrice(license.getPurchasePrice())
            .installGuide(license.getInstallGuide())
            .remarks(license.getRemarks())
            .isActive(license.getIsActive())
            .regDate(license.getRegDate())
            .build();
    }
}
