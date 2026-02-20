package com.assetmanagement.asset.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class AssetAssignmentRequest {

    @NotNull(message = "자산 ID는 필수입니다")
    private Long assetId;

    @NotNull(message = "사용자 ID는 필수입니다")
    private Long memberId;

    @NotNull(message = "배정일은 필수입니다")
    private LocalDate assignedDate;

    private String remarks;
}
