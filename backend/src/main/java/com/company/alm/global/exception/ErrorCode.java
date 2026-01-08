package com.company.alm.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common
    INVALID_INPUT_VALUE(400, "C001", "잘못된 입력값입니다."),
    INTERNAL_SERVER_ERROR(500, "C002", "서버 오류가 발생했습니다."),

    // User
    USER_NOT_FOUND(404, "U001", "사용자를 찾을 수 없습니다."),
    DUPLICATE_USERNAME(400, "U002", "이미 존재하는 사용자명입니다."),

    // Asset
    ASSET_NOT_FOUND(404, "A001", "자산을 찾을 수 없습니다."),
    ASSET_ALREADY_ASSIGNED(400, "A002", "이미 배정된 자산입니다."),

    // License
    LICENSE_NOT_FOUND(404, "L001", "라이센스를 찾을 수 없습니다."),
    LICENSE_NOT_AVAILABLE(400, "L002", "할당 가능한 라이센스가 없습니다.");

    private final int status;
    private final String code;
    private final String message;
}
