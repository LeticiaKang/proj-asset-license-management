package com.assetmanagement.license.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class LicenseKeyRequest {

    @NotBlank(message = "라이센스 키는 필수입니다")
    @Size(max = 500, message = "라이센스 키는 500자 이하여야 합니다")
    private String licenseKey;

    private String remarks;
}
