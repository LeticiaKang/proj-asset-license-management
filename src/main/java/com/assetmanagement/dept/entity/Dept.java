package com.assetmanagement.dept.entity;

import com.assetmanagement.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "dept")
public class Dept extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dept_id")
    private Long deptId;

    @Column(name = "parent_dept_id")
    private Long parentDeptId;

    @Column(name = "dept_name", nullable = false, length = 100)
    private String deptName;

    @Column(name = "dept_code", nullable = false, unique = true, length = 50)
    private String deptCode;

    @Column(name = "dept_order", nullable = false)
    @Builder.Default
    private Integer deptOrder = 0;

    @Column(name = "dept_depth", nullable = false)
    @Builder.Default
    private Integer deptDepth = 0;

    @Column(name = "dept_path", length = 500)
    private String deptPath;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    public void updatePath(String deptPath) {
        this.deptPath = deptPath;
    }

    public void updateDepthAndPath(int depth, String path) {
        this.deptDepth = depth;
        this.deptPath = path;
    }

    public void move(Long newParentDeptId, int newDepth, String newPath) {
        this.parentDeptId = newParentDeptId;
        this.deptDepth = newDepth;
        this.deptPath = newPath;
    }
}
