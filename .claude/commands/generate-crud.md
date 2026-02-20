---
description: 도메인 CRUD API (Controller + Service + Specification) 생성
---

docs/api-specification.md에서 `$ARGUMENTS` 도메인의 API 명세를 읽고,
Spring Boot 스킬(.claude/skills/spring-boot/SKILL.md)의 규칙을 따라서 아래 파일을 생성해줘.

1. **Controller**: @RestController, API 명세의 엔드포인트와 정확히 일치, Swagger 어노테이션 포함
2. **Service**: 비즈니스 로직, @Transactional 관리, 상태 전이 검증 (docs/system-policy.md 참조)
3. **Specification**: 검색 조건이 있는 경우 동적 쿼리용

작업 전 체크사항:
- Entity, DTO, Repository가 이미 있는지 확인
- 없으면 먼저 생성할지 물어볼 것
- 상태 전이 규칙은 docs/system-policy.md에서 확인
- 에러 코드는 docs/system-policy.md 섹션 9 참조
