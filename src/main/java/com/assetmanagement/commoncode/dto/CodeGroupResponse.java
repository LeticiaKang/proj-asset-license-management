package com.assetmanagement.commoncode.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CodeGroupResponse {

    private String groupCode;
    private long codeCount;
}
