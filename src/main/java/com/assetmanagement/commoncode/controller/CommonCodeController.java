package com.assetmanagement.commoncode.controller;

import com.assetmanagement.commoncode.dto.CodeGroupResponse;
import com.assetmanagement.commoncode.dto.CommonCodeResponse;
import com.assetmanagement.commoncode.service.CommonCodeService;
import com.assetmanagement.global.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "공통 코드", description = "공통 코드 조회 API")
@RestController
@RequestMapping("/api/v1/codes")
@RequiredArgsConstructor
public class CommonCodeController {

    private final CommonCodeService commonCodeService;

    @Operation(summary = "코드 그룹 목록")
    @GetMapping
    public ApiResponse<List<CodeGroupResponse>> getCodeGroups() {
        return ApiResponse.ok(commonCodeService.getCodeGroups());
    }

    @Operation(summary = "그룹별 코드 목록")
    @GetMapping("/{groupCode}")
    public ApiResponse<List<CommonCodeResponse>> getCodesByGroup(@PathVariable String groupCode) {
        return ApiResponse.ok(commonCodeService.getCodesByGroup(groupCode));
    }
}
