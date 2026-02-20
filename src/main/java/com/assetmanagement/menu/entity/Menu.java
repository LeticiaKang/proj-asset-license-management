package com.assetmanagement.menu.entity;

import com.assetmanagement.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "menu")
public class Menu extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "menu_id")
    private Long menuId;

    @Column(name = "parent_menu_id")
    private Long parentMenuId;

    @Column(name = "menu_name", nullable = false, length = 100)
    private String menuName;

    @Column(name = "menu_code", nullable = false, unique = true, length = 50)
    private String menuCode;

    @Column(name = "menu_url", length = 255)
    private String menuUrl;

    @Column(name = "menu_icon", length = 100)
    private String menuIcon;

    @Column(name = "menu_order", nullable = false)
    @Builder.Default
    private Integer menuOrder = 0;

    @Column(name = "menu_depth", nullable = false)
    @Builder.Default
    private Integer menuDepth = 0;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
