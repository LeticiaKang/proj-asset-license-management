package com.assetmanagement.role.entity;

import com.assetmanagement.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "role_menu",
    uniqueConstraints = @UniqueConstraint(name = "uk_role_menu", columnNames = {"role_id", "menu_id"}))
public class RoleMenu extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_menu_id")
    private Long roleMenuId;

    @Column(name = "role_id", nullable = false)
    private Long roleId;

    @Column(name = "menu_id", nullable = false)
    private Long menuId;

    @Column(name = "can_read", nullable = false)
    @Builder.Default
    private Boolean canRead = false;

    @Column(name = "can_create", nullable = false)
    @Builder.Default
    private Boolean canCreate = false;

    @Column(name = "can_update", nullable = false)
    @Builder.Default
    private Boolean canUpdate = false;

    @Column(name = "can_delete", nullable = false)
    @Builder.Default
    private Boolean canDelete = false;
}
