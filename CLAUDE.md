# IT 자산 & 라이센스 관리 시스템

## Tech Stack
- Backend: Spring Boot 3 + Java 17 + Spring Data JPA + Spring Security
- Frontend: React + TypeScript + Ant Design
- DB: PostgreSQL 15+
- Cache: Redis (Spring Data Redis)
- API Docs: SpringDoc OpenAPI 3 (Swagger)
- Deploy: Docker Compose + k3s (Kubernetes)
- Build: Gradle (Kotlin DSL)
- 외부 라이브러리: Lombok, jjwt, SpringDoc (최소 라이브러리 원칙)
- 동적 쿼리: Spring Data JPA Specification + @Query (QueryDSL 미사용)

## 설계 문서 (작업 전 반드시 참조)
- `docs/ddl_v1.3.sql` — DB 스키마 (테이블 17개, 트리거 2개, 뷰 3개)
- `docs/erd_v1.3.mermaid` — ERD 다이어그램
- `docs/api-specification.md` — API 명세서 (~50 endpoints)
- `docs/system-policy.md` — 정책 정의서 (상태전이, 수량관리, 보안 등)

## Skills (복잡한 작업 시 자동 참조)
- `.claude/skills/spring-boot/` — Spring Boot 백엔드 코드 생성 지침
- `.claude/skills/react-frontend/` — React 프론트엔드 코드 생성 지침

## 핵심 설계 결정
- 테이블 접두사 없음 (tb_ 미사용)
- 사용자 테이블명: `member` (PostgreSQL 예약어 회피)
- 공통 컬럼: reg_date, reg_id, upd_date, upd_id, is_deleted
- 이력 테이블(INSERT-ONLY): reg_date, reg_id만 포함
- 소프트 삭제 전체 적용 (is_deleted = true)
- 자산 배정: 자산 중심 히스토리 (asset_history)
- 라이센스 배정: 사람 중심 히스토리 (license_history)
- 수량 관리: Redis 분산락 + DB 트리거 + CHECK 제약 + 배치 검증
- 부서 트리: Materialized Path 패턴, 최대 5단계
- 라이센스 유형: VOLUME, INDIVIDUAL, SUBSCRIPTION

## 코딩 컨벤션

### 공통 원칙
- 모르거나 애매한 것은 임의 판단하지 말고 반드시 물어볼 것
- 검증된 안정적 기술 우선 사용
- 사실에 근거하고 논리적/비판적으로 검토 후 진행

### Java/Spring
- 패키지: `com.assetmanagement.{domain}.{layer}`
- Entity: Lombok 사용, BaseEntity 상속
- Controller → Service → Repository 레이어
- Request/Response DTO 분리, Entity 직접 노출 금지
- 예외 처리: GlobalExceptionHandler + BusinessException
- 에러 코드: docs/system-policy.md 섹션 9 따를 것

### SQL
- tab 들여쓰기, 대문자 키워드, 테이블 alias 사용

### React/TypeScript
- 함수형 컴포넌트 + Hooks
- Ant Design 컴포넌트 활용
- axios + React Query + Zustand
