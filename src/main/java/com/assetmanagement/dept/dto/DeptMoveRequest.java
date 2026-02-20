package com.assetmanagement.dept.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DeptMoveRequest {

    @NotNull(message = "이동할 상위 부서 ID는 필수입니다")
    private Long newParentDeptId;
}
