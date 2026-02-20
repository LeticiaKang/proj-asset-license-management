package com.assetmanagement.member.controller;

import com.assetmanagement.global.dto.ApiResponse;
import com.assetmanagement.member.dto.*;
import com.assetmanagement.member.service.MemberService;
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

@Tag(name = "사용자 관리", description = "사용자 CRUD + 권한 매핑 API")
@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @Operation(summary = "사용자 목록 (페이징, 검색)")
    @GetMapping
    public ApiResponse<Page<MemberResponse>> getMembers(
            MemberSearchCondition condition,
            @PageableDefault(size = 20, sort = "regDate", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.ok(memberService.getMembers(condition, pageable));
    }

    @Operation(summary = "사용자 상세 조회")
    @GetMapping("/{id}")
    public ApiResponse<MemberResponse> getMember(@PathVariable Long id) {
        return ApiResponse.ok(memberService.getMember(id));
    }

    @Operation(summary = "사용자 등록")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MemberResponse> createMember(@Valid @RequestBody MemberRequest request) {
        Long regId = 1L;
        return ApiResponse.ok(memberService.createMember(request, regId));
    }

    @Operation(summary = "사용자 수정")
    @PutMapping("/{id}")
    public ApiResponse<MemberResponse> updateMember(
            @PathVariable Long id,
            @Valid @RequestBody MemberRequest request) {
        Long updId = 1L;
        return ApiResponse.ok(memberService.updateMember(id, request, updId));
    }

    @Operation(summary = "사용자 비활성화")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteMember(@PathVariable Long id) {
        Long updId = 1L;
        memberService.deleteMember(id, updId);
        return ApiResponse.ok(null, "사용자가 비활성화되었습니다.");
    }

    @Operation(summary = "사용자 권한 조회")
    @GetMapping("/{id}/roles")
    public ApiResponse<List<MemberRoleResponse>> getMemberRoles(@PathVariable Long id) {
        return ApiResponse.ok(memberService.getMemberRoles(id));
    }

    @Operation(summary = "사용자 권한 설정")
    @PutMapping("/{id}/roles")
    public ApiResponse<List<MemberRoleResponse>> updateMemberRoles(
            @PathVariable Long id,
            @Valid @RequestBody MemberRoleRequest request) {
        Long updId = 1L;
        return ApiResponse.ok(memberService.updateMemberRoles(id, request, updId));
    }
}
