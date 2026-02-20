package com.assetmanagement.license.dto;

import com.assetmanagement.license.entity.LicenseKey;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LicenseKeyResponse {

    private Long keyId;
    private Long licenseId;
    private String licenseKey;
    private String keyStatus;
    private String remarks;

    public static LicenseKeyResponse from(LicenseKey key) {
        return LicenseKeyResponse.builder()
            .keyId(key.getKeyId())
            .licenseId(key.getLicense().getLicenseId())
            .licenseKey(key.getLicenseKey())
            .keyStatus(key.getKeyStatus())
            .remarks(key.getRemarks())
            .build();
    }
}
