package com.assetmanagement.software.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SoftwareRequest {

    @NotBlank(message = "소프트웨어명은 필수입니다")
    @Size(max = 100)
    private String softwareName;

    @Size(max = 100)
    private String publisher;

    private String description;
}
