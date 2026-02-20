package com.assetmanagement.auth.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MeResponse {

    private Long memberId;
    private String loginId;
    private String memberName;
    private Long deptId;
    private String position;
    private Boolean isInitialPassword;
    private List<String> roles;
}
