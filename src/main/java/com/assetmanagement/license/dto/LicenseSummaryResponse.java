package com.assetmanagement.license.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
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
}
