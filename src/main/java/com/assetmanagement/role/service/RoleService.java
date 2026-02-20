package com.assetmanagement.role.service;

import com.assetmanagement.global.exception.BusinessException;
import com.assetmanagement.global.exception.ErrorCode;
import com.assetmanagement.role.dto.*;
import com.assetmanagement.role.entity.Role;
import com.assetmanagement.role.entity.RoleMenu;
import com.assetmanagement.role.repository.RoleMenuRepository;
import com.assetmanagement.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleService {

    private final RoleRepository roleRepository;
    private final RoleMenuRepository roleMenuRepository;

    public List<RoleResponse> getRoles() {
        return roleRepository.findByIsDeletedFalse().stream()
            .map(RoleResponse::from)
            .toList();
    }

    public RoleResponse getRole(Long roleId) {
        return RoleResponse.from(findRoleOrThrow(roleId));
    }

    @Transactional
    public RoleResponse createRole(RoleRequest request, Long regId) {
        Role role = Role.builder()
            .roleName(request.getRoleName())
            .roleCode(request.getRoleCode())
            .description(request.getDescription())
            .build();

        role.setRegId(regId);
        role.setUpdId(regId);

        return RoleResponse.from(roleRepository.save(role));
    }

    @Transactional
    public RoleResponse updateRole(Long roleId, RoleRequest request, Long updId) {
        Role existing = findRoleOrThrow(roleId);

        Role updated = Role.builder()
            .roleId(existing.getRoleId())
            .roleName(request.getRoleName())
            .roleCode(request.getRoleCode())
            .description(request.getDescription())
            .isActive(existing.getIsActive())
            .build();

        updated.setUpdId(updId);
        return RoleResponse.from(roleRepository.save(updated));
    }

    @Transactional
    public void deleteRole(Long roleId, Long updId) {
        Role role = findRoleOrThrow(roleId);
        role.softDelete(updId);
    }

    public List<RoleMenuResponse> getRoleMenus(Long roleId) {
        findRoleOrThrow(roleId);
        return roleMenuRepository.findByRoleIdAndIsDeletedFalse(roleId).stream()
            .map(RoleMenuResponse::from)
            .toList();
    }

    @Transactional
    public List<RoleMenuResponse> updateRoleMenus(Long roleId, RoleMenuRequest request, Long updId) {
        findRoleOrThrow(roleId);

        // 기존 매핑 소프트 삭제
        List<RoleMenu> existing = roleMenuRepository.findByRoleIdAndIsDeletedFalse(roleId);
        for (RoleMenu rm : existing) {
            rm.softDelete(updId);
        }

        // 새 매핑 생성
        List<RoleMenu> newMappings = request.getMenuPermissions().stream()
            .map(mp -> {
                RoleMenu rm = RoleMenu.builder()
                    .roleId(roleId)
                    .menuId(mp.getMenuId())
                    .canRead(mp.getCanRead() != null ? mp.getCanRead() : false)
                    .canCreate(mp.getCanCreate() != null ? mp.getCanCreate() : false)
                    .canUpdate(mp.getCanUpdate() != null ? mp.getCanUpdate() : false)
                    .canDelete(mp.getCanDelete() != null ? mp.getCanDelete() : false)
                    .build();
                rm.setRegId(updId);
                rm.setUpdId(updId);
                return rm;
            })
            .toList();

        return roleMenuRepository.saveAll(newMappings).stream()
            .map(RoleMenuResponse::from)
            .toList();
    }

    private Role findRoleOrThrow(Long roleId) {
        return roleRepository.findByRoleIdAndIsDeletedFalse(roleId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));
    }
}
