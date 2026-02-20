package com.assetmanagement.license.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class LicenseAssignmentRequest {

    @NotNull(message = "라이센스 ID는 필수입니다")
    private Long licenseId;

    private Long keyId;

    @NotNull(message = "사용자 ID는 필수입니다")
    private Long memberId;

    @NotNull(message = "배정일은 필수입니다")
    private LocalDate assignedDate;

    @NotBlank(message = "배정 사유는 필수입니다")
    private String assignmentReason;

    private String remarks;
}
