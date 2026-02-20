---
description: Spring Boot 프로젝트 초기 설정 (build.gradle.kts, 글로벌 설정, Docker Compose)
allowed-tools: Bash, Read, Write
---

이 프로젝트를 Spring Boot 3 백엔드로 초기화해줘.
CLAUDE.md의 Tech Stack을 따르고, Spring Boot 스킬을 참조해.

## 1단계: Gradle 프로젝트

build.gradle.kts 생성:
- Spring Boot 3.x (최신 안정 버전)
- Java 17
- 의존성: Spring Web, Spring Data JPA, Spring Security, Spring Data Redis,
  Spring Validation, PostgreSQL Driver, Lombok, jjwt, SpringDoc OpenAPI

## 2단계: 글로벌 설정 클래스

- `global/config/SecurityConfig.java` — JWT 필터 체인
- `global/config/RedisConfig.java` — Redis 연결 + 캐시
- `global/config/SwaggerConfig.java` — OpenAPI 설정
- `global/entity/BaseEntity.java` — 공통 Entity
- `global/entity/BaseHistoryEntity.java` — 이력 Entity
- `global/dto/ApiResponse.java` — 공통 응답
- `global/exception/ErrorCode.java` — docs/system-policy.md 섹션 9 에러 코드
- `global/exception/BusinessException.java`
- `global/exception/GlobalExceptionHandler.java`
- `global/security/JwtTokenProvider.java`
- `global/util/RedisLockUtil.java`

## 3단계: Docker Compose

docker-compose.yml:
- PostgreSQL 15
- Redis 7
- 환경변수로 DB 접속 정보 관리

## 4단계: application.yml

- 프로필: local, dev, prod
- PostgreSQL 연결, Redis 연결, JWT 설정, Swagger 설정

각 단계별로 진행 상황을 보여주고, 완료 후 프로젝트 구조를 tree로 출력해줘.
