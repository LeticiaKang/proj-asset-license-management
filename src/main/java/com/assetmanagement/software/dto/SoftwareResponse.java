package com.assetmanagement.software.dto;

import com.assetmanagement.software.entity.Software;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SoftwareResponse {

    private Long softwareId;
    private String softwareName;
    private String publisher;
    private String description;
    private Boolean isActive;

    public static SoftwareResponse from(Software software) {
        return SoftwareResponse.builder()
            .softwareId(software.getSoftwareId())
            .softwareName(software.getSoftwareName())
            .publisher(software.getPublisher())
            .description(software.getDescription())
            .isActive(software.getIsActive())
            .build();
    }
}
