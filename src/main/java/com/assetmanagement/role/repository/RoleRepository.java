package com.assetmanagement.role.repository;

import com.assetmanagement.role.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    List<Role> findByIsDeletedFalse();

    Optional<Role> findByRoleIdAndIsDeletedFalse(Long roleId);
}
