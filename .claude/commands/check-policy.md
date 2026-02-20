---
description: 현재 코드가 정책 문서와 일치하는지 검증
allowed-tools: Read, Grep, Glob
---

docs/system-policy.md 정책 문서를 읽고, 현재 구현된 코드에서 아래 항목을 검증해줘.

## 검증 항목

1. **상태 전이 규칙**: Service 레이어에서 허용된 전이만 구현되었는지
   - 자산 상태 (섹션 5.1)
   - 재직 상태 (섹션 4.2)
   - 라이센스 키 상태 (섹션 6.3)

2. **수량 관리**: 라이센스 배정 시 잔여수량 체크 + Redis 분산락 사용 여부

3. **퇴사 처리**: 7단계 프로세스가 모두 구현되었는지 (섹션 4.3)

4. **소프트 삭제**: 모든 삭제가 is_deleted = true로 처리되는지

5. **에러 코드**: BusinessException에서 올바른 ErrorCode를 사용하는지

6. **이력 테이블**: INSERT-ONLY 원칙 위반 없는지 (UPDATE/DELETE 호출 없어야 함)

7. **API 엔드포인트 커버리지**: docs/api-specification.md에 정의된 모든 엔드포인트가 실제 Controller에 구현되었는지 검증
   - `src/main/java/**/controller/` 디렉터리의 모든 Controller 파일을 스캔
   - `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, `@RequestMapping` 어노테이션에서 실제 URL 매핑 추출
   - API 명세서의 엔드포인트 목록과 1:1 대조
   - 각 섹션별로 결과를 표로 출력:

   | 섹션 | Method | URL | 상태 |
   |------|--------|-----|------|
   | 1. 인증 | POST | /api/v1/auth/login | ✅ 구현됨 / ⚠️ 미구현 |

결과를 ✅ 통과 / ❌ 위반 / ⚠️ 미구현으로 표시해줘.
