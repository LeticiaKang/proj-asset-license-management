package com.assetmanagement.role.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RoleRequest {

    @NotBlank(message = "권한명은 필수입니다")
    @Size(max = 50)
    private String roleName;

    @NotBlank(message = "권한 코드는 필수입니다")
    @Size(max = 50)
    private String roleCode;

    @Size(max = 255)
    private String description;
}
