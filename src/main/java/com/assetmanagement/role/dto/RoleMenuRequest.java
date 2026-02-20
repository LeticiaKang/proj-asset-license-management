package com.assetmanagement.role.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class RoleMenuRequest {

    @NotNull
    @Valid
    private List<MenuPermission> menuPermissions;

    @Getter
    @Builder
    public static class MenuPermission {
        @NotNull
        private Long menuId;
        private Boolean canRead;
        private Boolean canCreate;
        private Boolean canUpdate;
        private Boolean canDelete;
    }
}
