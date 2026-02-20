package com.assetmanagement.member.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MemberRoleRequest {

    @NotNull(message = "권한 ID 목록은 필수입니다")
    private List<Long> roleIds;
}
