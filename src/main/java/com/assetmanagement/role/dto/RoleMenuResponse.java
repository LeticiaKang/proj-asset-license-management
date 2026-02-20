package com.assetmanagement.role.dto;

import com.assetmanagement.role.entity.RoleMenu;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RoleMenuResponse {

    private Long roleMenuId;
    private Long roleId;
    private Long menuId;
    private Boolean canRead;
    private Boolean canCreate;
    private Boolean canUpdate;
    private Boolean canDelete;

    public static RoleMenuResponse from(RoleMenu roleMenu) {
        return RoleMenuResponse.builder()
            .roleMenuId(roleMenu.getRoleMenuId())
            .roleId(roleMenu.getRoleId())
            .menuId(roleMenu.getMenuId())
            .canRead(roleMenu.getCanRead())
            .canCreate(roleMenu.getCanCreate())
            .canUpdate(roleMenu.getCanUpdate())
            .canDelete(roleMenu.getCanDelete())
            .build();
    }
}
