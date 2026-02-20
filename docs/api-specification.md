# IT 자산 & 라이센스 관리 시스템 - API 명세서

> **Tech Stack**: Spring Boot 3 + React + TypeScript + Ant Design + PostgreSQL + Redis  
> **API Base URL**: `/api/v1`  
> **인증**: Spring Security + JWT (Bearer Token)

---

## 공통 사항

### 공통 응답 형식
```json
{
  "success": true,
  "data": { },
  "message": "성공",
  "timestamp": "2026-02-20T10:00:00"
}
```

### 공통 에러 응답
```json
{
  "success": false,
  "data": null,
  "message": "에러 메시지",
  "errorCode": "ERR_001",
  "timestamp": "2026-02-20T10:00:00"
}
```

### 페이징 요청 파라미터
| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| page | int | 0 | 페이지 번호 (0부터) |
| size | int | 20 | 페이지 크기 |
| sort | string | createdAt,desc | 정렬 기준 |

### 페이징 응답 형식
```json
{
  "content": [],
  "totalElements": 100,
  "totalPages": 5,
  "number": 0,
  "size": 20
}
```

---

## 1. 인증 (Auth)

| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/v1/auth/login` | 로그인 |
| POST | `/api/v1/auth/logout` | 로그아웃 |
| POST | `/api/v1/auth/refresh` | 토큰 갱신 |
| GET | `/api/v1/auth/me` | 내 정보 조회 |

### POST `/api/v1/auth/login`
- **Request**
```json
{
  "loginId": "admin",
  "password": "password123"
}
```
- **Response**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

---

## 2. 메뉴 관리 (Menu)

| Method | URL | 설명 | 권한 |
|--------|-----|------|------|
| GET | `/api/v1/menus` | 메뉴 트리 조회 | ALL |
| GET | `/api/v1/menus/{id}` | 메뉴 상세 조회 | ADMIN |
| POST | `/api/v1/menus` | 메뉴 등록 | ADMIN |
| PUT | `/api/v1/menus/{id}` | 메뉴 수정 | ADMIN |
| DELETE | `/api/v1/menus/{id}` | 메뉴 삭제 | ADMIN |

### GET `/api/v1/menus` — 트리 구조 응답
```json
[
  {
    "menuId": 1,
    "menuName": "시스템 관리",
    "menuCode": "SYS",
    "menuUrl": null,
    "menuIcon": "setting",
    "menuOrder": 1,
    "menuDepth": 0,
    "isActive": true,
    "children": [
      {
        "menuId": 2,
        "menuName": "메뉴 관리",
        "menuCode": "SYS_MENU",
        "menuUrl": "/system/menus",
        "menuOrder": 1,
        "menuDepth": 1,
        "children": []
      }
    ]
  }
]
```

---

## 3. 권한 관리 (Role)

| Method | URL | 설명 | 권한 |
|--------|-----|------|------|
| GET | `/api/v1/roles` | 권한 목록 조회 | ADMIN |
| GET | `/api/v1/roles/{id}` | 권한 상세 조회 | ADMIN |
| POST | `/api/v1/roles` | 권한 등록 | ADMIN |
| PUT | `/api/v1/roles/{id}` | 권한 수정 | ADMIN |
| DELETE | `/api/v1/roles/{id}` | 권한 삭제 | ADMIN |
| GET | `/api/v1/roles/{id}/menus` | 권한별 메뉴 권한 조회 | ADMIN |
| PUT | `/api/v1/roles/{id}/menus` | 권한별 메뉴 권한 설정 | ADMIN |

### PUT `/api/v1/roles/{id}/menus` — 메뉴별 권한 일괄 설정
- **Request**
```json
{
  "menuPermissions": [
    { "menuId": 1, "canRead": true, "canCreate": true, "canUpdate": true, "canDelete": false },
    { "menuId": 2, "canRead": true, "canCreate": false, "canUpdate": false, "canDelete": false }
  ]
}
```

---

## 4. 부서 관리 (Department)

| Method | URL | 설명 | 권한 |
|--------|-----|------|------|
| GET | `/api/v1/depts` | 부서 트리 조회 | ALL |
| GET | `/api/v1/depts/{id}` | 부서 상세 조회 | ADMIN |
| POST | `/api/v1/depts` | 부서 등록 | ADMIN |
| PUT | `/api/v1/depts/{id}` | 부서 수정 | ADMIN |
| DELETE | `/api/v1/depts/{id}` | 부서 삭제 (비활성화) | ADMIN |
| PUT | `/api/v1/depts/{id}/move` | 부서 이동 (트리 구조 변경) | ADMIN |

### POST `/api/v1/depts`
- **Request**
```json
{
  "parentDeptId": 1,
  "deptName": "개발2팀",
  "deptCode": "DEV2",
  "deptOrder": 2
}
```

### PUT `/api/v1/depts/{id}/move` — 부서 이동
- **Request**
```json
{
  "newParentDeptId": 3
}
```
> 하위 부서의 depth, path 자동 재계산

---

## 5. 사용자 관리 (Member)

| Method | URL | 설명 | 권한 |
|--------|-----|------|------|
| GET | `/api/v1/members` | 사용자 목록 (페이징, 검색) | ADMIN, MANAGER |
| GET | `/api/v1/members/{id}` | 사용자 상세 조회 | ADMIN, MANAGER |
| POST | `/api/v1/members` | 사용자 등록 | ADMIN |
| PUT | `/api/v1/members/{id}` | 사용자 수정 | ADMIN |
| DELETE | `/api/v1/members/{id}` | 사용자 비활성화 | ADMIN |
| GET | `/api/v1/members/{id}/roles` | 사용자 권한 조회 | ADMIN |
| PUT | `/api/v1/members/{id}/roles` | 사용자 권한 설정 | ADMIN |

### GET `/api/v1/members` — 검색 파라미터
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| keyword | string | 이름/아이디 검색 |
| deptId | long | 부서 필터 |
| employmentStatus | string | 재직상태 필터 (ACTIVE/RESIGNED/LEAVE) |

### POST `/api/v1/members`
- **Request**
```json
{
  "loginId": "hong.gildong",
  "password": "initial1234!",
  "memberName": "홍길동",
  "deptId": 3,
  "position": "SENIOR",
  "jobTitle": "백엔드 개발",
  "hireDate": "2024-03-01",
  "workLocation": "서울 본사",
  "email": "hong@company.com",
  "phone": "010-1234-5678"
}
```

---

## 6. 자산 현황 (Asset)

| Method | URL | 설명 | 권한 |
|--------|-----|------|------|
| GET | `/api/v1/assets` | 자산 목록 (페이징, 검색) | ADMIN, MANAGER |
| GET | `/api/v1/assets/{id}` | 자산 상세 조회 | ADMIN, MANAGER |
| POST | `/api/v1/assets` | 자산 등록 | ADMIN, MANAGER |
| PUT | `/api/v1/assets/{id}` | 자산 수정 | ADMIN, MANAGER |
| DELETE | `/api/v1/assets/{id}` | 자산 삭제 (소프트딜리트) | ADMIN |
| GET | `/api/v1/assets/summary` | 자산 유형별 현황 요약 | ALL |
| GET | `/api/v1/assets/{id}/history` | 자산 배정 이력 조회 | ADMIN, MANAGER |
| GET | `/api/v1/assets/categories` | 자산 카테고리 목록 | ALL |
| POST | `/api/v1/assets/categories` | 자산 카테고리 등록 | ADMIN |
| PUT | `/api/v1/assets/categories/{id}` | 자산 카테고리 수정 | ADMIN |
| DELETE | `/api/v1/assets/categories/{id}` | 자산 카테고리 삭제 | ADMIN |

### GET `/api/v1/assets` — 검색 파라미터
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| keyword | string | 자산명/시리얼번호/모델명 검색 |
| categoryId | long | 자산 유형 필터 |
| assetStatus | string | 자산 상태 필터 |

### POST `/api/v1/assets`
- **Request**
```json
{
  "categoryId": 1,
  "assetName": "개발팀 데스크톱 #01",
  "manufacturer": "삼성",
  "modelName": "DB400T7B",
  "serialNumber": "SN-2024-001",
  "purchaseDate": "2024-01-15",
  "purchasePrice": 1500000,
  "warrantyStartDate": "2024-01-15",
  "warrantyEndDate": "2027-01-14",
  "assetStatus": "AVAILABLE",
  "memory": "32GB",
  "storage": "512GB NVMe SSD",
  "specs": {
    "cpu": "Intel i7-13700",
    "gpu": "NVIDIA RTX 4060",
    "mainboard": "ASUS B660M"
  },
  "remarks": ""
}
```

---

## 7. 자산 사용 관리 (Asset Assignment)

| Method | URL | 설명 | 권한 |
|--------|-----|------|------|
| GET | `/api/v1/asset-assignments` | 배정 목록 (페이징) | ADMIN, MANAGER |
| GET | `/api/v1/asset-assignments/members/{memberId}` | 사용자별 배정 상세보기 | ADMIN, MANAGER |
| POST | `/api/v1/asset-assignments` | 자산 배정 | ADMIN, MANAGER |
| PUT | `/api/v1/asset-assignments/{id}/return` | 자산 반납 | ADMIN, MANAGER |
| PUT | `/api/v1/asset-assignments/{id}/transfer` | 자산 이관 (다른 사용자로) | ADMIN, MANAGER |

### GET `/api/v1/asset-assignments/members/{memberId}` — 상세보기 응답
> 사용자 정보 + 자산 배정 현황 + 소프트웨어 배정 현황을 한번에 반환
```json
{
  "userInfo": {
    "memberName": "홍길동",
    "loginId": "hong.gildong",
    "deptName": "개발1팀",
    "hireDate": "2024-03-01",
    "resignDate": null
  },
  "assetAssignments": [
    {
      "assignmentId": 1,
      "categoryName": "데스크톱",
      "assetName": "개발팀 데스크톱 #01",
      "manufacturer": "삼성",
      "modelName": "DB400T7B",
      "assignedDate": "2024-03-01"
    },
    {
      "assignmentId": 2,
      "categoryName": "모니터",
      "assetName": "27인치 모니터 #05",
      "manufacturer": "LG",
      "modelName": "27GP850",
      "assignedDate": "2024-03-01"
    }
  ],
  "licenseAssignments": [
    {
      "assignmentId": 10,
      "softwareName": "IntelliJ IDEA",
      "licenseVersion": "2024.1",
      "licenseType": "INDIVIDUAL",
      "assignedDate": "2024-03-05",
      "assignmentReason": "신규입사 개발환경 세팅"
    }
  ]
}
```

### POST `/api/v1/asset-assignments` — 자산 배정
- **Request**
```json
{
  "assetId": 1,
  "memberId": 5,
  "assignedDate": "2024-03-01",
  "remarks": "신규입사 장비 배정"
}
```
- **Validation**
  - 해당 자산이 AVAILABLE 상태인지 확인
  - 이미 다른 사용자에게 배정(ASSIGNED)되어 있지 않은지 확인
  - 통과 시: 자산 상태를 IN_USE로 변경, 배정 레코드 INSERT, 히스토리 INSERT
  - **Redis Lock**: `asset:assign:{assetId}` 키로 분산락 획득 후 처리

### PUT `/api/v1/asset-assignments/{id}/return` — 자산 반납
- **Request**
```json
{
  "returnDate": "2024-06-01",
  "remarks": "퇴사로 인한 장비 반납"
}
```
- **Process**: 배정 상태 RETURNED, 반납일 기록, 자산 상태 AVAILABLE, 히스토리 INSERT

---

## 8. 라이센스 현황 (License)

| Method | URL | 설명 | 권한 |
|--------|-----|------|------|
| GET | `/api/v1/licenses` | 라이센스 목록 (페이징) | ADMIN, MANAGER |
| GET | `/api/v1/licenses/{id}` | 라이센스 상세 (키 포함) | ADMIN, MANAGER |
| POST | `/api/v1/licenses` | 라이센스 등록 | ADMIN |
| PUT | `/api/v1/licenses/{id}` | 라이센스 수정 | ADMIN |
| DELETE | `/api/v1/licenses/{id}` | 라이센스 비활성화 | ADMIN |
| GET | `/api/v1/licenses/{id}/keys` | 라이센스 키 목록 | ADMIN |
| POST | `/api/v1/licenses/{id}/keys` | 라이센스 키 등록 | ADMIN |
| PUT | `/api/v1/licenses/keys/{keyId}` | 라이센스 키 수정 | ADMIN |
| GET | `/api/v1/licenses/summary` | 라이센스 요약 현황 | ALL |

### GET `/api/v1/licenses` — 검색 파라미터
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| keyword | string | 소프트웨어명 검색 |
| licenseType | string | 라이센스 유형 필터 |
| softwareId | long | 소프트웨어 필터 |

### POST `/api/v1/licenses`
- **Request**
```json
{
  "softwareId": 1,
  "licenseType": "VOLUME",
  "licenseVersion": "2024.1",
  "totalQty": 50,
  "purchaseDate": "2024-01-01",
  "expiryDate": "2025-01-01",
  "purchasePrice": 25000000,
  "installGuide": "1. 다운로드: https://...\n2. 설치 후 키 입력\n3. ...",
  "remarks": "연간 구독"
}
```

### GET `/api/v1/licenses/{id}` — 상세 응답 (키 포함)
```json
{
  "licenseId": 1,
  "softwareName": "Microsoft Office 365",
  "licenseType": "VOLUME",
  "licenseVersion": "2024",
  "totalQty": 50,
  "usedQty": 35,
  "remainQty": 15,
  "purchaseDate": "2024-01-01",
  "expiryDate": "2025-01-01",
  "keys": [
    {
      "keyId": 1,
      "licenseKey": "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
      "keyStatus": "IN_USE"
    }
  ]
}
```

---

## 9. 라이센스 사용 관리 (License Assignment)

| Method | URL | 설명 | 권한 |
|--------|-----|------|------|
| GET | `/api/v1/license-assignments` | 배정 목록 (페이징) | ADMIN, MANAGER |
| GET | `/api/v1/license-assignments/members/{memberId}` | 사용자별 배정 상세보기 | ADMIN, MANAGER |
| POST | `/api/v1/license-assignments` | 라이센스 배정 | ADMIN, MANAGER |
| PUT | `/api/v1/license-assignments/{id}/return` | 라이센스 회수 | ADMIN, MANAGER |
| PUT | `/api/v1/license-assignments/{id}` | 라이센스 배정 수정 | ADMIN, MANAGER |

### POST `/api/v1/license-assignments` — 라이센스 배정
- **Request**
```json
{
  "licenseId": 1,
  "keyId": null,
  "memberId": 5,
  "assignedDate": "2024-03-01",
  "assignmentReason": "신규입사 개발도구 세팅"
}
```
- **Validation**
  - `used_qty < total_qty` 확인 → 초과 시 에러 반환
  - INDIVIDUAL 유형: keyId 필수, 해당 키가 AVAILABLE인지 확인
  - VOLUME 유형: keyId 선택, 수량만 체크
  - SUBSCRIPTION 유형: 만료일 확인
  - **Redis Lock**: `license:assign:{licenseId}` 키로 분산락 획득 후 처리
  - 통과 시: 배정 INSERT, used_qty 증가(트리거), 키 상태 IN_USE, 히스토리 INSERT

### GET `/api/v1/license-assignments/members/{memberId}` — 상세보기 응답
> 자산 사용 관리와 동일한 구조 (사용자 정보 + 자산 배정 현황 + 소프트웨어 배정 현황)
```json
{
  "userInfo": {
    "memberName": "홍길동",
    "loginId": "hong.gildong",
    "deptName": "개발1팀",
    "hireDate": "2024-03-01",
    "resignDate": null
  },
  "assetAssignments": [ ... ],
  "licenseAssignments": [ ... ]
}
```

---

## 10. 소프트웨어 관리 (Software)

| Method | URL | 설명 | 권한 |
|--------|-----|------|------|
| GET | `/api/v1/softwares` | 소프트웨어 목록 | ADMIN, MANAGER |
| GET | `/api/v1/softwares/{id}` | 소프트웨어 상세 | ADMIN, MANAGER |
| POST | `/api/v1/softwares` | 소프트웨어 등록 | ADMIN |
| PUT | `/api/v1/softwares/{id}` | 소프트웨어 수정 | ADMIN |

---

## 11. 공통 코드 (Common Code)

| Method | URL | 설명 | 권한 |
|--------|-----|------|------|
| GET | `/api/v1/codes` | 코드 그룹 목록 | ALL |
| GET | `/api/v1/codes/{groupCode}` | 그룹별 코드 목록 | ALL |
| POST | `/api/v1/codes` | 공통 코드 등록 | ADMIN |
| PUT | `/api/v1/codes/{id}` | 공통 코드 수정 | ADMIN |
| DELETE | `/api/v1/codes/{id}` | 공통 코드 삭제 | ADMIN |

### POST `/api/v1/codes`
- **Request**
```json
{
  "groupCode": "ASSET_STATUS",
  "code": "REPAIR",
  "codeName": "수리중",
  "codeOrder": 3,
  "description": "수리 진행 중인 자산"
}
```

### POST `/api/v1/assets/categories`
- **Request**
```json
{
  "categoryName": "데스크톱",
  "parentCategoryId": null,
  "categoryOrder": 1
}
```

---

## 수량 관리 정합성 전략

### 실시간 (배정/회수 시점)
1. **Redis 분산락** 획득 (`SETNX`, TTL 30초)
2. DB에서 현재 수량 확인 (`used_qty < total_qty`)
3. 배정 INSERT + 트리거로 `used_qty` 자동 증감
4. Redis 락 해제

### 배치 검증 (1일 1회)
- `v_license_qty_check` 뷰를 이용하여 recorded_used_qty vs actual_used_qty 비교
- MISMATCH 발견 시 actual 기준으로 보정 + 알림

### Redis 활용
| Key Pattern | 용도 | TTL |
|-------------|------|-----|
| `asset:assign:{assetId}` | 자산 배정 분산락 | 30s |
| `license:assign:{licenseId}` | 라이센스 배정 분산락 | 30s |
| `license:qty:{licenseId}` | 잔여 수량 캐시 | 5min |
| `dept:tree` | 부서 트리 캐시 | 10min |
| `menu:tree` | 메뉴 트리 캐시 | 30min |
| `user:session:{token}` | 사용자 세션 | 1h |
