package com.assetmanagement.license.controller;

import com.assetmanagement.global.dto.ApiResponse;
import com.assetmanagement.license.dto.*;
import com.assetmanagement.license.service.LicenseService;
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

@Tag(name = "라이센스 현황", description = "라이센스 CRUD + 키 관리 API")
@RestController
@RequestMapping("/api/v1/licenses")
@RequiredArgsConstructor
public class LicenseController {

    private final LicenseService licenseService;

    @Operation(summary = "라이센스 목록 조회 (페이징, 검색)")
    @GetMapping
    public ApiResponse<Page<LicenseResponse>> getLicenses(
            LicenseSearchCondition condition,
            @PageableDefault(size = 20, sort = "regDate", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.ok(licenseService.getLicenses(condition, pageable));
    }

    @Operation(summary = "라이센스 상세 조회 (키 포함)")
    @GetMapping("/{id}")
    public ApiResponse<LicenseDetailResponse> getLicense(@PathVariable Long id) {
        return ApiResponse.ok(licenseService.getLicense(id));
    }

    @Operation(summary = "라이센스 등록")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LicenseResponse> createLicense(
            @Valid @RequestBody LicenseRequest request) {
        Long regId = 1L;
        return ApiResponse.ok(licenseService.createLicense(request, regId));
    }

    @Operation(summary = "라이센스 수정")
    @PutMapping("/{id}")
    public ApiResponse<LicenseResponse> updateLicense(
            @PathVariable Long id,
            @Valid @RequestBody LicenseRequest request) {
        Long updId = 1L;
        return ApiResponse.ok(licenseService.updateLicense(id, request, updId));
    }

    @Operation(summary = "라이센스 비활성화")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteLicense(@PathVariable Long id) {
        Long updId = 1L;
        licenseService.deleteLicense(id, updId);
        return ApiResponse.ok(null, "라이센스가 비활성화되었습니다.");
    }

    @Operation(summary = "라이센스 키 목록 조회")
    @GetMapping("/{id}/keys")
    public ApiResponse<List<LicenseKeyResponse>> getLicenseKeys(@PathVariable Long id) {
        return ApiResponse.ok(licenseService.getLicenseKeys(id));
    }

    @Operation(summary = "라이센스 키 등록")
    @PostMapping("/{id}/keys")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LicenseKeyResponse> createLicenseKey(
            @PathVariable Long id,
            @Valid @RequestBody LicenseKeyRequest request) {
        Long regId = 1L;
        return ApiResponse.ok(licenseService.createLicenseKey(id, request, regId));
    }

    @Operation(summary = "라이센스 키 수정")
    @PutMapping("/keys/{keyId}")
    public ApiResponse<LicenseKeyResponse> updateLicenseKey(
            @PathVariable Long keyId,
            @Valid @RequestBody LicenseKeyRequest request) {
        Long updId = 1L;
        return ApiResponse.ok(licenseService.updateLicenseKey(keyId, request, updId));
    }

    @Operation(summary = "라이센스 요약 현황")
    @GetMapping("/summary")
    public ApiResponse<List<LicenseSummaryResponse>> getLicenseSummary() {
        return ApiResponse.ok(licenseService.getLicenseSummary());
    }
}
