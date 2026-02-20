package com.assetmanagement.asset.controller;

import com.assetmanagement.asset.dto.AssetAssignmentRequest;
import com.assetmanagement.asset.dto.AssetAssignmentResponse;
import com.assetmanagement.asset.dto.AssetReturnRequest;
import com.assetmanagement.asset.dto.AssetTransferRequest;
import com.assetmanagement.asset.service.AssetAssignmentService;
import com.assetmanagement.global.dto.ApiResponse;
import com.assetmanagement.member.dto.MemberAssignmentDetailResponse;
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

@Tag(name = "자산 사용 관리", description = "자산 배정/반납/이관 API")
@RestController
@RequestMapping("/api/v1/asset-assignments")
@RequiredArgsConstructor
public class AssetAssignmentController {

    private final AssetAssignmentService assetAssignmentService;

    @Operation(summary = "배정 목록 조회 (페이징)")
    @GetMapping
    public ApiResponse<Page<AssetAssignmentResponse>> getAssignments(
            @PageableDefault(size = 20, sort = "regDate", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.ok(assetAssignmentService.getAssignments(pageable));
    }

    @Operation(summary = "사용자별 배정 상세보기")
    @GetMapping("/members/{memberId}")
    public ApiResponse<MemberAssignmentDetailResponse> getMemberAssignmentDetail(
            @PathVariable Long memberId) {
        return ApiResponse.ok(assetAssignmentService.getMemberAssignmentDetail(memberId));
    }

    @Operation(summary = "자산 배정")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AssetAssignmentResponse> assignAsset(
            @Valid @RequestBody AssetAssignmentRequest request) {
        Long regId = 1L;
        return ApiResponse.ok(assetAssignmentService.assignAsset(request, regId));
    }

    @Operation(summary = "자산 반납")
    @PutMapping("/{id}/return")
    public ApiResponse<Void> returnAsset(
            @PathVariable Long id,
            @RequestBody AssetReturnRequest request) {
        Long updId = 1L;
        assetAssignmentService.returnAsset(id, request, updId);
        return ApiResponse.ok(null, "자산이 반납되었습니다.");
    }

    @Operation(summary = "자산 이관 (다른 사용자로)")
    @PutMapping("/{id}/transfer")
    public ApiResponse<Void> transferAsset(
            @PathVariable Long id,
            @Valid @RequestBody AssetTransferRequest request) {
        Long updId = 1L;
        assetAssignmentService.transferAsset(id, request, updId);
        return ApiResponse.ok(null, "자산이 이관되었습니다.");
    }
}
