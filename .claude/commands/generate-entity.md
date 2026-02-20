---
description: DDL 기반으로 JPA Entity + DTO + Repository 생성
---

docs/ddl_v1.3.sql에서 `$ARGUMENTS` 테이블의 DDL을 읽고,
Spring Boot 스킬(.claude/skills/spring-boot/SKILL.md)의 규칙을 따라서 아래 파일을 생성해줘.

1. **Entity 클래스**: DDL 컬럼과 정확히 일치, BaseEntity 또는 BaseHistoryEntity 상속
2. **Request DTO**: 생성/수정용 (validation 어노테이션 포함)
3. **Response DTO**: 조회 응답용 (from() 정적 팩토리 메서드 포함)
4. **Repository 인터페이스**: JpaRepository + JpaSpecificationExecutor 상속

테이블이 이력 테이블(asset_history, license_history, password_history)이면 BaseHistoryEntity를 상속하고, 나머지는 BaseEntity를 상속해.

패키지는 `com.assetmanagement.{도메인}.{레이어}` 규칙을 따라.
