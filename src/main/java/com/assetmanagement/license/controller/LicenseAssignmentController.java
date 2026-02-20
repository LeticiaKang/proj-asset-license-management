package com.assetmanagement.license.controller;

import com.assetmanagement.global.dto.ApiResponse;
import com.assetmanagement.license.dto.LicenseAssignmentRequest;
import com.assetmanagement.license.dto.LicenseAssignmentResponse;
import com.assetmanagement.license.dto.LicenseReturnRequest;
import com.assetmanagement.license.service.LicenseAssignmentService;
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

@Tag(name = "라이센스 사용 관리", description = "라이센스 배정/회수 API")
@RestController
@RequestMapping("/api/v1/license-assignments")
@RequiredArgsConstructor
public class LicenseAssignmentController {

    private final LicenseAssignmentService licenseAssignmentService;

    @Operation(summary = "배정 목록 조회 (페이징)")
    @GetMapping
    public ApiResponse<Page<LicenseAssignmentResponse>> getAssignments(
            @PageableDefault(size = 20, sort = "regDate", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.ok(licenseAssignmentService.getAssignments(pageable));
    }

    @Operation(summary = "사용자별 배정 상세보기")
    @GetMapping("/members/{memberId}")
    public ApiResponse<MemberAssignmentDetailResponse> getMemberAssignmentDetail(
            @PathVariable Long memberId) {
        return ApiResponse.ok(licenseAssignmentService.getMemberAssignmentDetail(memberId));
    }

    @Operation(summary = "라이센스 배정")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LicenseAssignmentResponse> assignLicense(
            @Valid @RequestBody LicenseAssignmentRequest request) {
        Long regId = 1L;
        return ApiResponse.ok(licenseAssignmentService.assignLicense(request, regId));
    }

    @Operation(summary = "라이센스 회수")
    @PutMapping("/{id}/return")
    public ApiResponse<Void> returnLicense(
            @PathVariable Long id,
            @RequestBody(required = false) LicenseReturnRequest request) {
        Long updId = 1L;
        licenseAssignmentService.returnLicense(id, request, updId);
        return ApiResponse.ok(null, "라이센스가 회수되었습니다.");
    }

    @Operation(summary = "라이센스 배정 수정")
    @PutMapping("/{id}")
    public ApiResponse<LicenseAssignmentResponse> updateAssignment(
            @PathVariable Long id,
            @Valid @RequestBody LicenseAssignmentRequest request) {
        Long updId = 1L;
        return ApiResponse.ok(licenseAssignmentService.updateAssignment(id, request, updId));
    }
}
