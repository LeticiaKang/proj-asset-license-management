package com.assetmanagement.menu.dto;

import com.assetmanagement.menu.entity.Menu;
import lombok.Builder;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Builder
public class MenuResponse {

    private Long menuId;
    private Long parentMenuId;
    private String menuName;
    private String menuCode;
    private String menuUrl;
    private String menuIcon;
    private Integer menuOrder;
    private Integer menuDepth;
    private String description;
    private Boolean isActive;
    @Builder.Default
    private List<MenuResponse> children = new ArrayList<>();

    public static MenuResponse from(Menu menu) {
        return MenuResponse.builder()
            .menuId(menu.getMenuId())
            .parentMenuId(menu.getParentMenuId())
            .menuName(menu.getMenuName())
            .menuCode(menu.getMenuCode())
            .menuUrl(menu.getMenuUrl())
            .menuIcon(menu.getMenuIcon())
            .menuOrder(menu.getMenuOrder())
            .menuDepth(menu.getMenuDepth())
            .description(menu.getDescription())
            .isActive(menu.getIsActive())
            .children(new ArrayList<>())
            .build();
    }
}
