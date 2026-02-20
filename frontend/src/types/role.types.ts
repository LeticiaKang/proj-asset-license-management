export interface RoleResponse {
  roleId: number;
  roleName: string;
  roleCode: string;
  description: string | null;
  isActive: boolean;
}

export interface RoleRequest {
  roleName: string;
  roleCode: string;
  description?: string;
}

export interface RoleMenuPermission {
  menuId: number;
  menuName: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface RoleMenuUpdateRequest {
  menuPermissions: RoleMenuPermission[];
}
