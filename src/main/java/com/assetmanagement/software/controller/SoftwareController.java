package com.assetmanagement.software.controller;

import com.assetmanagement.global.dto.ApiResponse;
import com.assetmanagement.software.dto.SoftwareRequest;
import com.assetmanagement.software.dto.SoftwareResponse;
import com.assetmanagement.software.service.SoftwareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "소프트웨어 관리", description = "소프트웨어 CRUD API")
@RestController
@RequestMapping("/api/v1/softwares")
@RequiredArgsConstructor
public class SoftwareController {

    private final SoftwareService softwareService;

    @Operation(summary = "소프트웨어 목록")
    @GetMapping
    public ApiResponse<List<SoftwareResponse>> getSoftwares() {
        return ApiResponse.ok(softwareService.getSoftwares());
    }

    @Operation(summary = "소프트웨어 상세")
    @GetMapping("/{id}")
    public ApiResponse<SoftwareResponse> getSoftware(@PathVariable Long id) {
        return ApiResponse.ok(softwareService.getSoftware(id));
    }

    @Operation(summary = "소프트웨어 등록")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SoftwareResponse> createSoftware(@Valid @RequestBody SoftwareRequest request) {
        Long regId = 1L;
        return ApiResponse.ok(softwareService.createSoftware(request, regId));
    }

    @Operation(summary = "소프트웨어 수정")
    @PutMapping("/{id}")
    public ApiResponse<SoftwareResponse> updateSoftware(
            @PathVariable Long id,
            @Valid @RequestBody SoftwareRequest request) {
        Long updId = 1L;
        return ApiResponse.ok(softwareService.updateSoftware(id, request, updId));
    }
}
