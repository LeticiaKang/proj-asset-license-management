package com.assetmanagement.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Auth
    AUTH_001(HttpStatus.UNAUTHORIZED, "AUTH_001", "인증 실패 (잘못된 아이디/비밀번호)"),
    AUTH_002(HttpStatus.UNAUTHORIZED, "AUTH_002", "토큰 만료"),
    AUTH_003(HttpStatus.FORBIDDEN, "AUTH_003", "권한 없음"),
    AUTH_004(HttpStatus.LOCKED, "AUTH_004", "계정 잠금 (로그인 5회 실패)"),

    // User
    USER_001(HttpStatus.CONFLICT, "USER_001", "중복 로그인 ID"),
    USER_002(HttpStatus.BAD_REQUEST, "USER_002", "잘못된 상태 전이"),
    USER_003(HttpStatus.BAD_REQUEST, "USER_003", "배정 자산/라이센스 존재 (퇴사 처리 시 자동 회수 진행)"),

    // Dept
    DEPT_001(HttpStatus.BAD_REQUEST, "DEPT_001", "하위 부서 존재 (삭제 불가)"),
    DEPT_002(HttpStatus.BAD_REQUEST, "DEPT_002", "소속 사용자 존재 (삭제 불가)"),
    DEPT_003(HttpStatus.BAD_REQUEST, "DEPT_003", "최대 깊이 초과"),

    // Asset
    ASSET_001(HttpStatus.BAD_REQUEST, "ASSET_001", "잘못된 상태 전이"),
    ASSET_002(HttpStatus.CONFLICT, "ASSET_002", "이미 배정된 자산"),
    ASSET_003(HttpStatus.BAD_REQUEST, "ASSET_003", "배정 중인 자산 삭제 불가"),
    ASSET_004(HttpStatus.CONFLICT, "ASSET_004", "중복 시리얼번호"),

    // License
    LICENSE_001(HttpStatus.BAD_REQUEST, "LICENSE_001", "수량 초과 (잔여 수량 부족)"),
    LICENSE_002(HttpStatus.CONFLICT, "LICENSE_002", "동일 사용자 중복 배정"),
    LICENSE_003(HttpStatus.BAD_REQUEST, "LICENSE_003", "만료된 라이센스 배정 불가"),
    LICENSE_004(HttpStatus.BAD_REQUEST, "LICENSE_004", "배정 중인 라이센스 삭제 불가"),
    LICENSE_005(HttpStatus.BAD_REQUEST, "LICENSE_005", "INDIVIDUAL 유형인데 키 미지정"),
    LICENSE_006(HttpStatus.CONFLICT, "LICENSE_006", "이미 사용 중인 키"),

    // Menu
    MENU_001(HttpStatus.BAD_REQUEST, "MENU_001", "하위 메뉴 존재 (삭제 불가)"),

    // Common
    COMMON_001(HttpStatus.CONFLICT, "COMMON_001", "분산락 획득 실패 (동시 처리 충돌)"),
    COMMON_002(HttpStatus.BAD_REQUEST, "COMMON_002", "필수 파라미터 누락"),
    COMMON_003(HttpStatus.NOT_FOUND, "COMMON_003", "대상 데이터 없음");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
