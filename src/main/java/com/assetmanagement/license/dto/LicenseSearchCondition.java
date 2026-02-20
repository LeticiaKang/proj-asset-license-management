package com.assetmanagement.license.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LicenseSearchCondition {

    private String keyword;
    private String licenseType;
    private Long softwareId;
}
