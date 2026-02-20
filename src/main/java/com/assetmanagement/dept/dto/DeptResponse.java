package com.assetmanagement.dept.dto;

import com.assetmanagement.dept.entity.Dept;
import lombok.Builder;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Builder
public class DeptResponse {

    private Long deptId;
    private Long parentDeptId;
    private String deptName;
    private String deptCode;
    private Integer deptOrder;
    private Integer deptDepth;
    private String deptPath;
    private Boolean isActive;
    @Builder.Default
    private List<DeptResponse> children = new ArrayList<>();

    public static DeptResponse from(Dept dept) {
        return DeptResponse.builder()
            .deptId(dept.getDeptId())
            .parentDeptId(dept.getParentDeptId())
            .deptName(dept.getDeptName())
            .deptCode(dept.getDeptCode())
            .deptOrder(dept.getDeptOrder())
            .deptDepth(dept.getDeptDepth())
            .deptPath(dept.getDeptPath())
            .isActive(dept.getIsActive())
            .children(new ArrayList<>())
            .build();
    }
}
