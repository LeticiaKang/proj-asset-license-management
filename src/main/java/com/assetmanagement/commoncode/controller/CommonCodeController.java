package com.assetmanagement.commoncode.controller;

import com.assetmanagement.commoncode.dto.CodeGroupResponse;
import com.assetmanagement.commoncode.dto.CommonCodeRequest;
import com.assetmanagement.commoncode.dto.CommonCodeResponse;
import com.assetmanagement.commoncode.service.CommonCodeService;
import com.assetmanagement.global.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "공통 코드", description = "공통 코드 CRUD API")
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

    @Operation(summary = "공통 코드 등록")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CommonCodeResponse> createCode(@Valid @RequestBody CommonCodeRequest request) {
        Long regId = 1L;
        return ApiResponse.ok(commonCodeService.createCode(request, regId));
    }

    @Operation(summary = "공통 코드 수정")
    @PutMapping("/{id}")
    public ApiResponse<CommonCodeResponse> updateCode(
            @PathVariable Long id,
            @Valid @RequestBody CommonCodeRequest request) {
        Long updId = 1L;
        return ApiResponse.ok(commonCodeService.updateCode(id, request, updId));
    }

    @Operation(summary = "공통 코드 삭제")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCode(@PathVariable Long id) {
        Long updId = 1L;
        commonCodeService.deleteCode(id, updId);
        return ApiResponse.ok(null, "공통 코드가 삭제되었습니다.");
    }
}
