package com.assetmanagement.menu.repository;

import com.assetmanagement.menu.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MenuRepository extends JpaRepository<Menu, Long> {

    List<Menu> findByIsDeletedFalseOrderByMenuOrderAsc();

    Optional<Menu> findByMenuIdAndIsDeletedFalse(Long menuId);

    boolean existsByParentMenuIdAndIsDeletedFalse(Long parentMenuId);
}
