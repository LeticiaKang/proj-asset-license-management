package com.assetmanagement.member.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class MemberSearchCondition {
    private String keyword;
    private Long deptId;
    private String employmentStatus;
}
