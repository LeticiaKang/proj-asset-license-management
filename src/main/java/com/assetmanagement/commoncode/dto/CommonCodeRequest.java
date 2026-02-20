package com.assetmanagement.commoncode.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CommonCodeRequest {

    @NotBlank(message = "그룹 코드는 필수입니다.")
    private String groupCode;

    @NotBlank(message = "코드는 필수입니다.")
    private String code;

    @NotBlank(message = "코드명은 필수입니다.")
    private String codeName;

    private Integer codeOrder;

    private String description;
}
