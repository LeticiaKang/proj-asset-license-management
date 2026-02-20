package com.assetmanagement.dept.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DeptRequest {

    private Long parentDeptId;

    @NotBlank(message = "부서명은 필수입니다")
    @Size(max = 100)
    private String deptName;

    @NotBlank(message = "부서 코드는 필수입니다")
    @Size(max = 50)
    private String deptCode;

    private Integer deptOrder;
}
