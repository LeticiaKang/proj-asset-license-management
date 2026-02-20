package com.assetmanagement.license.dto;

import com.assetmanagement.license.entity.LicenseAssignment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class LicenseAssignmentResponse {

    private Long assignmentId;
    private Long licenseId;
    private String softwareName;
    private String licenseVersion;
    private String licenseType;
    private Long keyId;
    private Long memberId;
    private String memberName;
    private LocalDate assignedDate;
    private LocalDate returnDate;
    private String assignmentReason;
    private String assignmentStatus;
    private String remarks;

    public static LicenseAssignmentResponse from(LicenseAssignment assignment) {
        return LicenseAssignmentResponse.builder()
            .assignmentId(assignment.getAssignmentId())
            .licenseId(assignment.getLicense().getLicenseId())
            .softwareName(assignment.getLicense().getSoftware().getSoftwareName())
            .licenseVersion(assignment.getLicense().getLicenseVersion())
            .licenseType(assignment.getLicense().getLicenseType())
            .keyId(assignment.getLicenseKey() != null
                ? assignment.getLicenseKey().getKeyId() : null)
            .memberId(assignment.getMember().getMemberId())
            .memberName(assignment.getMember().getMemberName())
            .assignedDate(assignment.getAssignedDate())
            .returnDate(assignment.getReturnDate())
            .assignmentReason(assignment.getAssignmentReason())
            .assignmentStatus(assignment.getAssignmentStatus())
            .remarks(assignment.getRemarks())
            .build();
    }
}
