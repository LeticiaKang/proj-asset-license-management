package com.assetmanagement.role.repository;

import com.assetmanagement.role.entity.RoleMenu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoleMenuRepository extends JpaRepository<RoleMenu, Long> {

    List<RoleMenu> findByRoleIdAndIsDeletedFalse(Long roleId);
}
