package com.assetmanagement.asset.controller;

import com.assetmanagement.asset.dto.*;
import com.assetmanagement.asset.service.AssetService;
import com.assetmanagement.global.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "자산 현황", description = "자산 CRUD API")
@RestController
@RequestMapping("/api/v1/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @Operation(summary = "자산 목록 조회 (페이징, 검색)")
    @GetMapping
    public ApiResponse<Page<AssetResponse>> getAssets(
            AssetSearchCondition condition,
            @PageableDefault(size = 20, sort = "regDate", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.ok(assetService.getAssets(condition, pageable));
    }

    @Operation(summary = "자산 상세 조회")
    @GetMapping("/{id}")
    public ApiResponse<AssetResponse> getAsset(@PathVariable Long id) {
        return ApiResponse.ok(assetService.getAsset(id));
    }

    @Operation(summary = "자산 등록")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AssetResponse> createAsset(@Valid @RequestBody AssetRequest request) {
        // TODO: SecurityContext에서 현재 사용자 ID 추출
        Long regId = 1L;
        return ApiResponse.ok(assetService.createAsset(request, regId));
    }

    @Operation(summary = "자산 수정")
    @PutMapping("/{id}")
    public ApiResponse<AssetResponse> updateAsset(
            @PathVariable Long id,
            @Valid @RequestBody AssetRequest request) {
        Long updId = 1L;
        return ApiResponse.ok(assetService.updateAsset(id, request, updId));
    }

    @Operation(summary = "자산 삭제 (소프트 삭제)")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAsset(@PathVariable Long id) {
        Long updId = 1L;
        assetService.deleteAsset(id, updId);
        return ApiResponse.ok(null, "자산이 삭제되었습니다.");
    }

    @Operation(summary = "자산 유형별 현황 요약")
    @GetMapping("/summary")
    public ApiResponse<List<AssetSummaryResponse>> getAssetSummary() {
        return ApiResponse.ok(assetService.getAssetSummary());
    }

    @Operation(summary = "자산 배정 이력 조회")
    @GetMapping("/{id}/history")
    public ApiResponse<List<AssetHistoryResponse>> getAssetHistory(@PathVariable Long id) {
        return ApiResponse.ok(assetService.getAssetHistory(id));
    }

    @Operation(summary = "자산 카테고리 목록")
    @GetMapping("/categories")
    public ApiResponse<List<AssetCategoryResponse>> getCategories() {
        return ApiResponse.ok(assetService.getCategories());
    }

    @Operation(summary = "자산 카테고리 등록")
    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AssetCategoryResponse> createCategory(
            @Valid @RequestBody AssetCategoryRequest request) {
        Long regId = 1L;
        return ApiResponse.ok(assetService.createCategory(request, regId));
    }

    @Operation(summary = "자산 카테고리 수정")
    @PutMapping("/categories/{categoryId}")
    public ApiResponse<AssetCategoryResponse> updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody AssetCategoryRequest request) {
        Long updId = 1L;
        return ApiResponse.ok(assetService.updateCategory(categoryId, request, updId));
    }

    @Operation(summary = "자산 카테고리 삭제")
    @DeleteMapping("/categories/{categoryId}")
    public ApiResponse<Void> deleteCategory(@PathVariable Long categoryId) {
        Long updId = 1L;
        assetService.deleteCategory(categoryId, updId);
        return ApiResponse.ok(null, "카테고리가 삭제되었습니다.");
    }
}
