package com.assetmanagement.global.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.Comment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-validity}")
    private long accessTokenValidity;

    @Value("${jwt.refresh-token-validity}")
    private long refreshTokenValidity;

    private SecretKey secretKey;
    private final UserDetailsService userDetailsService;

    @Comment("초기화 : application.yml에서 jwt.secret으로")
    @PostConstruct
    protected void init() {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Comment("토큰 생성 : loginId(누구), memberId(DB PK, API 식별자용), roles(권한 정보) 기반이며, 1시간 유효")
    public String createAccessToken(String loginId, Long memberId, String roles) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenValidity);

        return Jwts.builder()
            .subject(loginId)
            .claim("memberId", memberId)
            .claim("roles", roles)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(secretKey)
            .compact();
    }

    @Comment("리프레시 토큰 생성")
    public String createRefreshToken(String loginId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshTokenValidity);

        return Jwts.builder()
            .subject(loginId)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(secretKey)
            .compact();
    }

    @Comment("인증 객체 생성")
    public Authentication getAuthentication(String token) {
        Claims claims = parseClaims(token); // 토큰 파싱
        UserDetails userDetails = userDetailsService.loadUserByUsername(claims.getSubject());   // DB에서 사용자 조회
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());  // 인증 객체 생성
    }

    @Comment("HTTP 요청에서 토큰 추출")
    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); //Authorization 헤더에서 "Bearer " 접두사를 제거하고 순수 토큰 문자열만 반환
        }
        return null;
    }

    @Comment("토큰 유효성 검증")
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Claims parseClaims(String token) {
        try {
            return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload(); // 서명 + 만료 시간 한 번에 검증. 예외 발생시 false
        } catch (ExpiredJwtException e) {
            return e.getClaims();   // 만료되어도 claims 반환
        }
    }
}
