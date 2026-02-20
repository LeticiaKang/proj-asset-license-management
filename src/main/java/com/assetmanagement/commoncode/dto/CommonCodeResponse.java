package com.assetmanagement.commoncode.dto;

import com.assetmanagement.commoncode.entity.CommonCode;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CommonCodeResponse {

    private Long codeId;
    private String groupCode;
    private String code;
    private String codeName;
    private Integer codeOrder;
    private String description;
    private Boolean isActive;

    public static CommonCodeResponse from(CommonCode commonCode) {
        return CommonCodeResponse.builder()
            .codeId(commonCode.getCodeId())
            .groupCode(commonCode.getGroupCode())
            .code(commonCode.getCode())
            .codeName(commonCode.getCodeName())
            .codeOrder(commonCode.getCodeOrder())
            .description(commonCode.getDescription())
            .isActive(commonCode.getIsActive())
            .build();
    }
}
