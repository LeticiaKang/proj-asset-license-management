package com.assetmanagement.license.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class LicenseRequest {

    @NotNull(message = "소프트웨어 ID는 필수입니다")
    private Long softwareId;

    @NotBlank(message = "라이센스 유형은 필수입니다")
    @Size(max = 20, message = "라이센스 유형은 20자 이하여야 합니다")
    private String licenseType;

    @Size(max = 50, message = "버전은 50자 이하여야 합니다")
    private String licenseVersion;

    @NotNull(message = "총 수량은 필수입니다")
    @Min(value = 1, message = "총 수량은 1 이상이어야 합니다")
    private Integer totalQty;

    private LocalDate purchaseDate;

    private LocalDate expiryDate;

    private BigDecimal purchasePrice;

    private String installGuide;

    private String remarks;
}
