package com.assetmanagement.asset.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class AssetTransferRequest {

    @NotNull(message = "이관 대상 사용자 ID는 필수입니다")
    private Long newMemberId;

    private String remarks;
}
