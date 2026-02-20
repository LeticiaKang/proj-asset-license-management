package com.assetmanagement.asset.dto;

import com.assetmanagement.asset.entity.AssetAssignment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class AssetAssignmentResponse {

    private Long assignmentId;
    private Long assetId;
    private String assetName;
    private String categoryName;
    private String manufacturer;
    private String modelName;
    private Long memberId;
    private String memberName;
    private LocalDate assignedDate;
    private LocalDate returnDate;
    private String assignmentStatus;
    private String remarks;

    public static AssetAssignmentResponse from(AssetAssignment assignment) {
        return AssetAssignmentResponse.builder()
            .assignmentId(assignment.getAssignmentId())
            .assetId(assignment.getAsset().getAssetId())
            .assetName(assignment.getAsset().getAssetName())
            .categoryName(assignment.getAsset().getCategory().getCategoryName())
            .manufacturer(assignment.getAsset().getManufacturer())
            .modelName(assignment.getAsset().getModelName())
            .memberId(assignment.getMember().getMemberId())
            .memberName(assignment.getMember().getMemberName())
            .assignedDate(assignment.getAssignedDate())
            .returnDate(assignment.getReturnDate())
            .assignmentStatus(assignment.getAssignmentStatus())
            .remarks(assignment.getRemarks())
            .build();
    }
}
