package com.assetmanagement.license.dto;

import com.assetmanagement.license.entity.License;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class LicenseSummaryResponse {

    private Long softwareId;
    private String softwareName;
    private Long licenseId;
    private String licenseType;
    private String licenseVersion;
    private Integer totalQty;
    private Integer usedQty;
    private Integer remainQty;
    private LocalDate expiryDate;
    private String expiryStatus;

    public static LicenseSummaryResponse from(License license) {
        return LicenseSummaryResponse.builder()
            .softwareId(license.getSoftware().getSoftwareId())
            .softwareName(license.getSoftware().getSoftwareName())
            .licenseId(license.getLicenseId())
            .licenseType(license.getLicenseType())
            .licenseVersion(license.getLicenseVersion())
            .totalQty(license.getTotalQty())
            .usedQty(license.getUsedQty())
            .remainQty(license.getRemainQty())
            .expiryDate(license.getExpiryDate())
            .expiryStatus(resolveExpiryStatus(license.getExpiryDate()))
            .build();
    }

    private static String resolveExpiryStatus(LocalDate expiryDate) {
        if (expiryDate == null) return "ACTIVE";
        if (expiryDate.isBefore(LocalDate.now())) return "EXPIRED";
        if (!expiryDate.isAfter(LocalDate.now().plusDays(7))) return "EXPIRING_SOON";
        return "ACTIVE";
    }
}
