package com.assetmanagement.role.controller;

import com.assetmanagement.global.dto.ApiResponse;
import com.assetmanagement.role.dto.*;
import com.assetmanagement.role.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "권한 관리", description = "권한 CRUD + 메뉴 권한 매핑 API")
@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @Operation(summary = "권한 목록 조회")
    @GetMapping
    public ApiResponse<List<RoleResponse>> getRoles() {
        return ApiResponse.ok(roleService.getRoles());
    }

    @Operation(summary = "권한 상세 조회")
    @GetMapping("/{id}")
    public ApiResponse<RoleResponse> getRole(@PathVariable Long id) {
        return ApiResponse.ok(roleService.getRole(id));
    }

    @Operation(summary = "권한 등록")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RoleResponse> createRole(@Valid @RequestBody RoleRequest request) {
        Long regId = 1L;
        return ApiResponse.ok(roleService.createRole(request, regId));
    }

    @Operation(summary = "권한 수정")
    @PutMapping("/{id}")
    public ApiResponse<RoleResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleRequest request) {
        Long updId = 1L;
        return ApiResponse.ok(roleService.updateRole(id, request, updId));
    }

    @Operation(summary = "권한 삭제")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRole(@PathVariable Long id) {
        Long updId = 1L;
        roleService.deleteRole(id, updId);
        return ApiResponse.ok(null, "권한이 삭제되었습니다.");
    }

    @Operation(summary = "권한별 메뉴 권한 조회")
    @GetMapping("/{id}/menus")
    public ApiResponse<List<RoleMenuResponse>> getRoleMenus(@PathVariable Long id) {
        return ApiResponse.ok(roleService.getRoleMenus(id));
    }

    @Operation(summary = "권한별 메뉴 권한 설정")
    @PutMapping("/{id}/menus")
    public ApiResponse<List<RoleMenuResponse>> updateRoleMenus(
            @PathVariable Long id,
            @Valid @RequestBody RoleMenuRequest request) {
        Long updId = 1L;
        return ApiResponse.ok(roleService.updateRoleMenus(id, request, updId));
    }
}
