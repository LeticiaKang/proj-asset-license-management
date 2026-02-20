package com.assetmanagement.asset.dto;

import com.assetmanagement.asset.entity.AssetHistory;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AssetHistoryResponse {

    private Long historyId;
    private Long assetId;
    private Long memberId;
    private String actionType;
    private LocalDateTime actionDate;
    private String remarks;

    public static AssetHistoryResponse from(AssetHistory history) {
        return AssetHistoryResponse.builder()
            .historyId(history.getHistoryId())
            .assetId(history.getAssetId())
            .memberId(history.getMemberId())
            .actionType(history.getActionType())
            .actionDate(history.getActionDate())
            .remarks(history.getRemarks())
            .build();
    }
}
