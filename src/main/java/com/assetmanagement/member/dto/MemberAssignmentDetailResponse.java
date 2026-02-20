package com.assetmanagement.member.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class MemberAssignmentDetailResponse {

    private UserInfo userInfo;
    private List<AssetAssignmentItem> assetAssignments;
    private List<LicenseAssignmentItem> licenseAssignments;

    @Getter
    @Builder
    public static class UserInfo {
        private Long memberId;
        private String memberName;
        private String loginId;
        private Long deptId;
        private LocalDate hireDate;
        private LocalDate resignDate;
    }

    @Getter
    @Builder
    public static class AssetAssignmentItem {
        private Long assignmentId;
        private String categoryName;
        private String assetName;
        private String manufacturer;
        private String modelName;
        private LocalDate assignedDate;
    }

    @Getter
    @Builder
    public static class LicenseAssignmentItem {
        private Long assignmentId;
        private String softwareName;
        private String licenseVersion;
        private String licenseType;
        private LocalDate assignedDate;
        private String assignmentReason;
    }
}
