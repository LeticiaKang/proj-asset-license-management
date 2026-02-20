package com.assetmanagement.auth.controller;

import com.assetmanagement.auth.dto.LoginRequest;
import com.assetmanagement.auth.dto.LoginResponse;
import com.assetmanagement.auth.dto.MeResponse;
import com.assetmanagement.auth.dto.TokenRefreshRequest;
import com.assetmanagement.auth.service.AuthService;
import com.assetmanagement.global.dto.ApiResponse;
import io.jsonwebtoken.Claims;
import com.assetmanagement.global.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "인증", description = "로그인/로그아웃/토큰 갱신 API")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    @Operation(summary = "로그인")
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    @Operation(summary = "로그아웃")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);
        if (token != null) {
            Claims claims = jwtTokenProvider.parseClaims(token);
            Long memberId = claims.get("memberId", Long.class);
            authService.logout(memberId);
        }
        return ApiResponse.ok(null, "로그아웃되었습니다.");
    }

    @Operation(summary = "토큰 갱신")
    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        return ApiResponse.ok(authService.refresh(request));
    }

    @Operation(summary = "내 정보 조회")
    @GetMapping("/me")
    public ApiResponse<MeResponse> getMe(HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);
        Claims claims = jwtTokenProvider.parseClaims(token);
        Long memberId = claims.get("memberId", Long.class);
        return ApiResponse.ok(authService.getMe(memberId));
    }
}
