---
name: spring-boot
description: "Spring Boot 백엔드 코드 생성 스킬. Entity, DTO, Repository, Service, Controller 등 백엔드 코드를 생성할 때 자동으로 참조. 트리거: Entity 생성, CRUD API 구현, 서비스 로직 작성, JPA 쿼리 작성 시."
---

# Spring Boot 백엔드 코드 생성 지침

## 프로젝트 구조

```
src/main/java/com/assetmanagement/
├── global/                      # 글로벌 설정
│   ├── config/                  # 설정 클래스
│   │   ├── SecurityConfig.java
│   │   ├── RedisConfig.java
│   │   ├── SwaggerConfig.java
│   │   └── WebMvcConfig.java
│   ├── entity/                  # 공통 Entity
│   │   ├── BaseEntity.java      # reg_date, reg_id, upd_date, upd_id, is_deleted
│   │   └── BaseHistoryEntity.java  # reg_date, reg_id (INSERT-ONLY)
│   ├── dto/                     # 공통 DTO
│   │   └── ApiResponse.java     # {success, data, message, timestamp}
│   ├── exception/               # 예외 처리
│   │   ├── BusinessException.java
│   │   ├── ErrorCode.java       # docs/system-policy.md 섹션 9 에러 코드
│   │   └── GlobalExceptionHandler.java
│   ├── security/                # 인증/인가
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── CustomUserDetailsService.java
│   └── util/                    # 유틸리티
│       └── RedisLockUtil.java   # 분산락 유틸
├── auth/                        # 인증 도메인
│   ├── controller/
│   ├── dto/
│   └── service/
├── menu/                        # 메뉴 관리
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   └── service/
├── role/                        # 권한 관리
├── dept/                        # 부서 관리
├── member/                      # 사용자 관리
├── asset/                       # 자산 관리
│   ├── controller/
│   │   ├── AssetController.java
│   │   ├── AssetCategoryController.java
│   │   └── AssetAssignmentController.java
│   ├── dto/
│   │   ├── AssetRequest.java
│   │   ├── AssetResponse.java
│   │   ├── AssetSearchCondition.java
│   │   ├── AssetCategoryRequest.java
│   │   ├── AssetCategoryResponse.java
│   │   └── AssetAssignmentRequest.java
│   ├── entity/
│   │   ├── Asset.java
│   │   ├── AssetCategory.java
│   │   ├── AssetAssignment.java
│   │   └── AssetHistory.java
│   ├── repository/
│   │   ├── AssetRepository.java
│   │   ├── AssetCategoryRepository.java
│   │   └── AssetSpecification.java
│   └── service/
│       ├── AssetService.java
│       ├── AssetCategoryService.java
│       └── AssetAssignmentService.java
├── license/                     # 라이센스 관리
├── software/                    # 소프트웨어 관리
└── commoncode/                  # 공통 코드 관리
```

## BaseEntity 패턴

```java
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Column(name = "reg_id", updatable = false)
    private Long regId;

    @CreatedDate
    @Column(name = "reg_date", nullable = false, updatable = false)
    private LocalDateTime regDate;

    @Column(name = "upd_id")
    private Long updId;

    @LastModifiedDate
    @Column(name = "upd_date", nullable = false)
    private LocalDateTime updDate;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    public void softDelete(Long updId) {
        this.isDeleted = true;
        this.updId = updId;
    }
}
```

## BaseHistoryEntity (INSERT-ONLY 이력용)

```java
@Getter
@MappedSuperclass
public abstract class BaseHistoryEntity {

    @Column(name = "reg_id")
    private Long regId;

    @Column(name = "reg_date", nullable = false, updatable = false)
    private LocalDateTime regDate = LocalDateTime.now();
}
```

## Entity 작성 규칙

1. DDL(`docs/ddl_v1.3.sql`)의 테이블 정의와 정확히 일치시킬 것
2. `@Table(name = "테이블명")` — 접두사 없는 테이블명 그대로 사용
3. member 테이블: `@Table(name = "member")` — 예약어 이슈 없음 (user가 아니므로)
4. JSONB 컬럼: `@Type(JsonType.class)` + `@Column(columnDefinition = "jsonb")`
5. Enum 대신 String 사용 (공통코드 테이블 참조)
6. 연관관계: 기본 LAZY, 필요 시 fetch join

## DTO 분리 규칙

```
XxxRequest.java    — 생성/수정 요청 DTO (validation 포함)
XxxResponse.java   — 목록/상세 응답 DTO
XxxSearchCondition — 검색 조건 DTO (Specification에서 사용)
```

- Entity를 절대 Controller에서 직접 반환하지 않는다
- DTO → Entity: 정적 팩토리 메서드 `toEntity()`
- Entity → DTO: 정적 팩토리 메서드 `from(Entity)`

## Specification 패턴 (동적 검색)

```java
public class AssetSpecification {

    public static Specification<Asset> search(AssetSearchCondition cond) {
        return Specification.where(notDeleted())
            .and(keywordContains(cond.getKeyword()))
            .and(categoryEquals(cond.getCategoryId()))
            .and(statusEquals(cond.getAssetStatus()));
    }

    private static Specification<Asset> notDeleted() {
        return (root, query, cb) -> cb.isFalse(root.get("isDeleted"));
    }

    private static Specification<Asset> keywordContains(String keyword) {
        if (!StringUtils.hasText(keyword)) return null;
        return (root, query, cb) -> cb.or(
            cb.like(root.get("assetName"), "%" + keyword + "%"),
            cb.like(root.get("serialNumber"), "%" + keyword + "%")
        );
    }
    // ...
}
```

## Service 레이어 규칙

1. 비즈니스 로직은 반드시 Service에 위치
2. `@Transactional(readOnly = true)` 기본, 쓰기 메서드만 `@Transactional`
3. 상태 전이 검증: docs/system-policy.md의 상태 전이 규칙 반드시 체크
4. 수량 관리 시: Redis 분산락 → 잔여수량 체크 → 배정 처리 → 이력 기록
5. 예외 발생 시: ErrorCode enum의 코드를 사용하여 BusinessException throw

## Controller 레이어 규칙

1. `@RestController` + `@RequestMapping("/api/v1/{domain}")`
2. 응답은 항상 `ApiResponse<T>` 래핑
3. validation: `@Valid` + DTO 내부 `@NotNull`, `@NotBlank` 등
4. Swagger: `@Operation(summary = "...")`, `@Tag(name = "...")`

## Redis 분산락 패턴

```java
@Component
@RequiredArgsConstructor
public class RedisLockUtil {
    private final StringRedisTemplate redisTemplate;

    public boolean tryLock(String key, Duration ttl) {
        return Boolean.TRUE.equals(
            redisTemplate.opsForValue()
                .setIfAbsent(key, "LOCKED", ttl)
        );
    }

    public void unlock(String key) {
        redisTemplate.delete(key);
    }
}
```

사용 시:
```java
String lockKey = "license:assign:" + licenseId;
if (!redisLockUtil.tryLock(lockKey, Duration.ofSeconds(30))) {
    throw new BusinessException(ErrorCode.COMMON_001); // 분산락 획득 실패
}
try {
    // 배정 로직
} finally {
    redisLockUtil.unlock(lockKey);
}
```

## API 엔드포인트 전체 명세

> 상세 스키마는 `docs/api-specification.md` 참조

### 1. 인증 (`/api/v1/auth`)
| Method | URL | 설명 |
|--------|-----|------|
| POST | `/auth/login` | 로그인 |
| POST | `/auth/logout` | 로그아웃 |
| POST | `/auth/refresh` | 토큰 갱신 |
| GET | `/auth/me` | 내 정보 조회 |

### 2. 메뉴 (`/api/v1/menus`)
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/menus` | 메뉴 트리 조회 |
| GET | `/menus/{id}` | 메뉴 상세 |
| POST | `/menus` | 메뉴 등록 |
| PUT | `/menus/{id}` | 메뉴 수정 |
| DELETE | `/menus/{id}` | 메뉴 삭제 |

### 3. 권한 (`/api/v1/roles`)
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/roles` | 권한 목록 |
| GET | `/roles/{id}` | 권한 상세 |
| POST | `/roles` | 권한 등록 |
| PUT | `/roles/{id}` | 권한 수정 |
| DELETE | `/roles/{id}` | 권한 삭제 |
| GET | `/roles/{id}/menus` | 메뉴 권한 조회 |
| PUT | `/roles/{id}/menus` | 메뉴 권한 설정 |

### 4. 부서 (`/api/v1/depts`)
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/depts` | 부서 트리 조회 |
| GET | `/depts/{id}` | 부서 상세 |
| POST | `/depts` | 부서 등록 |
| PUT | `/depts/{id}` | 부서 수정 |
| DELETE | `/depts/{id}` | 부서 삭제 |
| PUT | `/depts/{id}/move` | 부서 이동 |

### 5. 사용자 (`/api/v1/members`)
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/members` | 사용자 목록 (페이징, 검색) |
| GET | `/members/{id}` | 사용자 상세 |
| POST | `/members` | 사용자 등록 |
| PUT | `/members/{id}` | 사용자 수정 |
| DELETE | `/members/{id}` | 사용자 비활성화 |
| GET | `/members/{id}/roles` | 사용자 권한 조회 |
| PUT | `/members/{id}/roles` | 사용자 권한 설정 |

### 6. 자산 (`/api/v1/assets`)
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/assets` | 자산 목록 (페이징, 검색) |
| GET | `/assets/{id}` | 자산 상세 |
| POST | `/assets` | 자산 등록 |
| PUT | `/assets/{id}` | 자산 수정 |
| DELETE | `/assets/{id}` | 자산 삭제 |
| GET | `/assets/summary` | 자산 현황 요약 |
| GET | `/assets/{id}/history` | 자산 이력 |
| GET | `/assets/categories` | 카테고리 목록 |
| POST | `/assets/categories` | 카테고리 등록 |
| PUT | `/assets/categories/{id}` | 카테고리 수정 |
| DELETE | `/assets/categories/{id}` | 카테고리 삭제 |

### 7. 자산 배정 (`/api/v1/asset-assignments`)
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/asset-assignments` | 배정 목록 |
| GET | `/asset-assignments/members/{memberId}` | 사용자별 상세 |
| POST | `/asset-assignments` | 자산 배정 |
| PUT | `/asset-assignments/{id}/return` | 자산 반납 |
| PUT | `/asset-assignments/{id}/transfer` | 자산 이관 |

### 8. 라이센스 (`/api/v1/licenses`)
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/licenses` | 라이센스 목록 (페이징) |
| GET | `/licenses/{id}` | 라이센스 상세 (키 포함) |
| POST | `/licenses` | 라이센스 등록 |
| PUT | `/licenses/{id}` | 라이센스 수정 |
| DELETE | `/licenses/{id}` | 라이센스 비활성화 |
| GET | `/licenses/{id}/keys` | 키 목록 |
| POST | `/licenses/{id}/keys` | 키 등록 |
| PUT | `/licenses/keys/{keyId}` | 키 수정 |
| GET | `/licenses/summary` | 라이센스 요약 |

### 9. 라이센스 배정 (`/api/v1/license-assignments`)
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/license-assignments` | 배정 목록 |
| GET | `/license-assignments/members/{memberId}` | 사용자별 상세 |
| POST | `/license-assignments` | 라이센스 배정 |
| PUT | `/license-assignments/{id}/return` | 라이센스 회수 |
| PUT | `/license-assignments/{id}` | 배정 수정 |

### 10. 소프트웨어 (`/api/v1/softwares`)
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/softwares` | 소프트웨어 목록 |
| GET | `/softwares/{id}` | 소프트웨어 상세 |
| POST | `/softwares` | 소프트웨어 등록 |
| PUT | `/softwares/{id}` | 소프트웨어 수정 |

### 11. 공통 코드 (`/api/v1/codes`)
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/codes` | 코드 그룹 목록 |
| GET | `/codes/{groupCode}` | 그룹별 코드 목록 |
| POST | `/codes` | 공통 코드 등록 |
| PUT | `/codes/{id}` | 공통 코드 수정 |
| DELETE | `/codes/{id}` | 공통 코드 삭제 |

---

## 주의사항

- 퇴사 처리 시 자산/라이센스 자동 회수 (docs/system-policy.md 4.3)
- 라이센스 배정 시 유형별 검증 분기 (VOLUME/INDIVIDUAL/SUBSCRIPTION)
- 이력 테이블은 INSERT-ONLY: UPDATE/DELETE 메서드 만들지 않을 것
- 비밀번호: BCryptPasswordEncoder 사용, 최근 3개 재사용 방지
