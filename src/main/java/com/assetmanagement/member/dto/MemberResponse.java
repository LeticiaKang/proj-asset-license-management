package com.assetmanagement.member.dto;

import com.assetmanagement.member.entity.Member;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class MemberResponse {

    private Long memberId;
    private String loginId;
    private String memberName;
    private Long deptId;
    private String position;
    private String jobTitle;
    private LocalDate hireDate;
    private LocalDate resignDate;
    private String employmentStatus;
    private String workLocation;
    private String email;
    private String phone;
    private Boolean isLocked;
    private Boolean isInitialPassword;
    private Boolean isActive;
    private LocalDateTime regDate;

    public static MemberResponse from(Member member) {
        return MemberResponse.builder()
            .memberId(member.getMemberId())
            .loginId(member.getLoginId())
            .memberName(member.getMemberName())
            .deptId(member.getDeptId())
            .position(member.getPosition())
            .jobTitle(member.getJobTitle())
            .hireDate(member.getHireDate())
            .resignDate(member.getResignDate())
            .employmentStatus(member.getEmploymentStatus())
            .workLocation(member.getWorkLocation())
            .email(member.getEmail())
            .phone(member.getPhone())
            .isLocked(member.getIsLocked())
            .isInitialPassword(member.getIsInitialPassword())
            .isActive(member.getIsActive())
            .regDate(member.getRegDate())
            .build();
    }
}
