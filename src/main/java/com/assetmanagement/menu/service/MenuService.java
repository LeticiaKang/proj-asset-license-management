package com.assetmanagement.menu.service;

import com.assetmanagement.global.exception.BusinessException;
import com.assetmanagement.global.exception.ErrorCode;
import com.assetmanagement.menu.dto.MenuRequest;
import com.assetmanagement.menu.dto.MenuResponse;
import com.assetmanagement.menu.entity.Menu;
import com.assetmanagement.menu.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuService {

    private final MenuRepository menuRepository;

    public List<MenuResponse> getMenuTree() {
        List<Menu> allMenus = menuRepository.findByIsDeletedFalseOrderByMenuOrderAsc();

        Map<Long, MenuResponse> map = new LinkedHashMap<>();
        for (Menu menu : allMenus) {
            map.put(menu.getMenuId(), MenuResponse.from(menu));
        }

        List<MenuResponse> roots = new ArrayList<>();
        for (MenuResponse response : map.values()) {
            if (response.getParentMenuId() == null) {
                roots.add(response);
            } else {
                MenuResponse parent = map.get(response.getParentMenuId());
                if (parent != null) {
                    parent.getChildren().add(response);
                }
            }
        }
        return roots;
    }

    public MenuResponse getMenu(Long menuId) {
        Menu menu = findMenuOrThrow(menuId);
        return MenuResponse.from(menu);
    }

    @Transactional
    public MenuResponse createMenu(MenuRequest request, Long regId) {
        int depth = 0;
        if (request.getParentMenuId() != null) {
            Menu parent = findMenuOrThrow(request.getParentMenuId());
            depth = parent.getMenuDepth() + 1;
        }

        Menu menu = Menu.builder()
            .parentMenuId(request.getParentMenuId())
            .menuName(request.getMenuName())
            .menuCode(request.getMenuCode())
            .menuUrl(request.getMenuUrl())
            .menuIcon(request.getMenuIcon())
            .menuOrder(request.getMenuOrder() != null ? request.getMenuOrder() : 0)
            .menuDepth(depth)
            .description(request.getDescription())
            .build();

        menu.setRegId(regId);
        menu.setUpdId(regId);

        return MenuResponse.from(menuRepository.save(menu));
    }

    @Transactional
    public MenuResponse updateMenu(Long menuId, MenuRequest request, Long updId) {
        Menu existing = findMenuOrThrow(menuId);

        int depth = 0;
        if (request.getParentMenuId() != null) {
            Menu parent = findMenuOrThrow(request.getParentMenuId());
            depth = parent.getMenuDepth() + 1;
        }

        Menu updated = Menu.builder()
            .menuId(existing.getMenuId())
            .parentMenuId(request.getParentMenuId())
            .menuName(request.getMenuName())
            .menuCode(request.getMenuCode())
            .menuUrl(request.getMenuUrl())
            .menuIcon(request.getMenuIcon())
            .menuOrder(request.getMenuOrder() != null ? request.getMenuOrder() : 0)
            .menuDepth(depth)
            .description(request.getDescription())
            .isActive(existing.getIsActive())
            .build();

        updated.setUpdId(updId);
        return MenuResponse.from(menuRepository.save(updated));
    }

    @Transactional
    public void deleteMenu(Long menuId, Long updId) {
        Menu menu = findMenuOrThrow(menuId);

        if (menuRepository.existsByParentMenuIdAndIsDeletedFalse(menuId)) {
            throw new BusinessException(ErrorCode.MENU_001);
        }

        menu.softDelete(updId);
    }

    private Menu findMenuOrThrow(Long menuId) {
        return menuRepository.findByMenuIdAndIsDeletedFalse(menuId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));
    }
}
