package com.assetmanagement.role.dto;

import com.assetmanagement.role.entity.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RoleResponse {

    private Long roleId;
    private String roleName;
    private String roleCode;
    private String description;
    private Boolean isActive;

    public static RoleResponse from(Role role) {
        return RoleResponse.builder()
            .roleId(role.getRoleId())
            .roleName(role.getRoleName())
            .roleCode(role.getRoleCode())
            .description(role.getDescription())
            .isActive(role.getIsActive())
            .build();
    }
}
