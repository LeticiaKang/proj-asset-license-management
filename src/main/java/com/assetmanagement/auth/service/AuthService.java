package com.assetmanagement.auth.service;

import com.assetmanagement.auth.dto.LoginRequest;
import com.assetmanagement.auth.dto.LoginResponse;
import com.assetmanagement.auth.dto.MeResponse;
import com.assetmanagement.auth.dto.TokenRefreshRequest;
import com.assetmanagement.global.exception.BusinessException;
import com.assetmanagement.global.exception.ErrorCode;
import com.assetmanagement.global.security.JwtTokenProvider;
import com.assetmanagement.member.entity.Member;
import com.assetmanagement.member.entity.MemberRole;
import com.assetmanagement.member.repository.MemberRepository;
import com.assetmanagement.member.repository.MemberRoleRepository;
import com.assetmanagement.role.entity.Role;
import com.assetmanagement.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final MemberRoleRepository memberRoleRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final StringRedisTemplate redisTemplate;

    @Value("${jwt.access-token-validity}")
    private long accessTokenValidity;

    @Value("${jwt.refresh-token-validity}")
    private long refreshTokenValidity;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Member member = memberRepository.findByLoginIdAndIsDeletedFalse(request.getLoginId())
            .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_001));

        // 계정 잠금 확인
        if (member.getIsLocked()) {
            throw new BusinessException(ErrorCode.AUTH_004);
        }

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            member.incrementLoginFailCount();
            throw new BusinessException(ErrorCode.AUTH_001);
        }

        // 로그인 성공 → 실패 횟수 초기화
        member.resetLoginFailCount();

        // 역할 조회
        String roles = getRoleCodesString(member.getMemberId());

        // 토큰 생성
        String accessToken = jwtTokenProvider.createAccessToken(
            member.getLoginId(), member.getMemberId(), roles);
        String refreshToken = jwtTokenProvider.createRefreshToken(member.getLoginId());

        // Refresh Token을 Redis에 저장
        String redisKey = "refresh:member:" + member.getMemberId() + ":" + refreshToken.substring(refreshToken.length() - 8);
        redisTemplate.opsForValue().set(redisKey, refreshToken, Duration.ofMillis(refreshTokenValidity));

        return LoginResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .expiresIn(accessTokenValidity / 1000)
            .build();
    }

    public void logout(Long memberId) {
        // Redis에서 해당 사용자의 모든 refresh token 삭제
        Set<String> keys = redisTemplate.keys("refresh:member:" + memberId + ":*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    @Transactional(readOnly = true)
    public LoginResponse refresh(TokenRefreshRequest request) {
        String refreshToken = request.getRefreshToken();

        // Refresh Token 유효성 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.AUTH_002);
        }

        String loginId = jwtTokenProvider.parseClaims(refreshToken).getSubject();
        Member member = memberRepository.findByLoginIdAndIsDeletedFalse(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_001));

        String roles = getRoleCodesString(member.getMemberId());

        // 새 Access Token 발급
        String newAccessToken = jwtTokenProvider.createAccessToken(
            member.getLoginId(), member.getMemberId(), roles);

        return LoginResponse.builder()
            .accessToken(newAccessToken)
            .refreshToken(refreshToken)
            .expiresIn(accessTokenValidity / 1000)
            .build();
    }

    @Transactional(readOnly = true)
    public MeResponse getMe(Long memberId) {
        Member member = memberRepository.findByMemberIdAndIsDeletedFalse(memberId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));

        List<String> roleCodes = getRoleCodes(memberId);

        return MeResponse.builder()
            .memberId(member.getMemberId())
            .loginId(member.getLoginId())
            .memberName(member.getMemberName())
            .deptId(member.getDeptId())
            .position(member.getPosition())
            .isInitialPassword(member.getIsInitialPassword())
            .roles(roleCodes)
            .build();
    }

    private List<String> getRoleCodes(Long memberId) {
        List<MemberRole> memberRoles = memberRoleRepository.findByMember_MemberIdAndIsDeletedFalse(memberId);
        List<Long> roleIds = memberRoles.stream().map(MemberRole::getRoleId).toList();

        return roleIds.stream()
            .map(roleId -> roleRepository.findByRoleIdAndIsDeletedFalse(roleId)
                .map(Role::getRoleCode)
                .orElse(null))
            .filter(code -> code != null)
            .toList();
    }

    private String getRoleCodesString(Long memberId) {
        return String.join(",", getRoleCodes(memberId));
    }
}
