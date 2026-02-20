package com.assetmanagement.asset.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Getter
@Builder
public class AssetRequest {

    @NotNull(message = "자산 유형은 필수입니다")
    private Long categoryId;

    @NotBlank(message = "자산명은 필수입니다")
    @Size(max = 100, message = "자산명은 100자 이하여야 합니다")
    private String assetName;

    @Size(max = 100, message = "제조사는 100자 이하여야 합니다")
    private String manufacturer;

    @Size(max = 100, message = "모델명은 100자 이하여야 합니다")
    private String modelName;

    @Size(max = 100, message = "시리얼번호는 100자 이하여야 합니다")
    private String serialNumber;

    private LocalDate purchaseDate;

    private BigDecimal purchasePrice;

    private LocalDate warrantyStartDate;

    private LocalDate warrantyEndDate;

    @Size(max = 50, message = "메모리는 50자 이하여야 합니다")
    private String memory;

    @Size(max = 50, message = "저장장치는 50자 이하여야 합니다")
    private String storage;

    private Map<String, Object> specs;

    private String remarks;
}
