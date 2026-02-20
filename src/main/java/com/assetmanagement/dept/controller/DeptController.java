package com.assetmanagement.dept.controller;

import com.assetmanagement.dept.dto.DeptMoveRequest;
import com.assetmanagement.dept.dto.DeptRequest;
import com.assetmanagement.dept.dto.DeptResponse;
import com.assetmanagement.dept.service.DeptService;
import com.assetmanagement.global.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "부서 관리", description = "부서 CRUD + 트리 구조 API")
@RestController
@RequestMapping("/api/v1/depts")
@RequiredArgsConstructor
public class DeptController {

    private final DeptService deptService;

    @Operation(summary = "부서 트리 조회")
    @GetMapping
    public ApiResponse<List<DeptResponse>> getDeptTree() {
        return ApiResponse.ok(deptService.getDeptTree());
    }

    @Operation(summary = "부서 상세 조회")
    @GetMapping("/{id}")
    public ApiResponse<DeptResponse> getDept(@PathVariable Long id) {
        return ApiResponse.ok(deptService.getDept(id));
    }

    @Operation(summary = "부서 등록")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<DeptResponse> createDept(@Valid @RequestBody DeptRequest request) {
        Long regId = 1L;
        return ApiResponse.ok(deptService.createDept(request, regId));
    }

    @Operation(summary = "부서 수정")
    @PutMapping("/{id}")
    public ApiResponse<DeptResponse> updateDept(
            @PathVariable Long id,
            @Valid @RequestBody DeptRequest request) {
        Long updId = 1L;
        return ApiResponse.ok(deptService.updateDept(id, request, updId));
    }

    @Operation(summary = "부서 삭제 (비활성화)")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteDept(@PathVariable Long id) {
        Long updId = 1L;
        deptService.deleteDept(id, updId);
        return ApiResponse.ok(null, "부서가 삭제되었습니다.");
    }

    @Operation(summary = "부서 이동 (트리 구조 변경)")
    @PutMapping("/{id}/move")
    public ApiResponse<DeptResponse> moveDept(
            @PathVariable Long id,
            @Valid @RequestBody DeptMoveRequest request) {
        Long updId = 1L;
        return ApiResponse.ok(deptService.moveDept(id, request, updId));
    }
}
