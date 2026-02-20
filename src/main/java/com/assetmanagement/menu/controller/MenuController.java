package com.assetmanagement.menu.controller;

import com.assetmanagement.global.dto.ApiResponse;
import com.assetmanagement.menu.dto.MenuRequest;
import com.assetmanagement.menu.dto.MenuResponse;
import com.assetmanagement.menu.service.MenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "메뉴 관리", description = "메뉴 CRUD API")
@RestController
@RequestMapping("/api/v1/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @Operation(summary = "메뉴 트리 조회")
    @GetMapping
    public ApiResponse<List<MenuResponse>> getMenuTree() {
        return ApiResponse.ok(menuService.getMenuTree());
    }

    @Operation(summary = "메뉴 상세 조회")
    @GetMapping("/{id}")
    public ApiResponse<MenuResponse> getMenu(@PathVariable Long id) {
        return ApiResponse.ok(menuService.getMenu(id));
    }

    @Operation(summary = "메뉴 등록")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MenuResponse> createMenu(@Valid @RequestBody MenuRequest request) {
        Long regId = 1L; // TODO: SecurityContext에서 추출
        return ApiResponse.ok(menuService.createMenu(request, regId));
    }

    @Operation(summary = "메뉴 수정")
    @PutMapping("/{id}")
    public ApiResponse<MenuResponse> updateMenu(
            @PathVariable Long id,
            @Valid @RequestBody MenuRequest request) {
        Long updId = 1L;
        return ApiResponse.ok(menuService.updateMenu(id, request, updId));
    }

    @Operation(summary = "메뉴 삭제")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteMenu(@PathVariable Long id) {
        Long updId = 1L;
        menuService.deleteMenu(id, updId);
        return ApiResponse.ok(null, "메뉴가 삭제되었습니다.");
    }
}
