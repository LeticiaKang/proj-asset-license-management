---
description: React 페이지 + API 연동 코드 생성
---

docs/api-specification.md에서 `$ARGUMENTS` 도메인의 API 명세를 읽고,
React 프론트엔드 스킬(.claude/skills/react-frontend/SKILL.md)의 규칙을 따라서 아래 순서로 작업해줘.

## 구현 순서

### Step 1: 기존 파일 확인
- `src/types/{domain}.types.ts` 존재 여부 확인 → 있으면 부족한 타입만 추가
- `src/api/{domain}.api.ts` 존재 여부 확인 → 있으면 부족한 함수만 추가

### Step 2: 타입 정의 (`src/types/{domain}.types.ts`)
- API 명세의 Response/Request JSON을 TypeScript interface로 변환
- 검색 조건이 있으면 `{Domain}SearchCondition` 추가

### Step 3: API 함수 (`src/api/{domain}.api.ts`)
- `client.ts` import, 응답은 `.then((r) => r.data.data)` 패턴
- 페이징: `ApiResponse<PageResponse<T>>`, 비페이징: `ApiResponse<T[]>`

### Step 4: 페이지 컴포넌트 (`src/pages/{domain}/`)
- SKILL.md의 구현 패턴(A~D) 중 해당 도메인에 맞는 패턴 적용
- 공통 컴포넌트 활용: SearchTable(페이징), FormModal(등록/수정), Table+expandable(트리)
- usePermission으로 권한 기반 렌더링
- App.useApp()으로 message/modal 사용
- 한국어 UI, 상태값은 Tag + STATUS_COLOR 매핑

### Step 5: 라우터 연결 (`src/App.tsx`)
- PlaceholderPage를 실제 컴포넌트로 교체
- import 추가, PermissionRoute 유지

## 도메인별 UI 패턴 (SKILL.md 섹션 11 참조)
- 메뉴/부서: 트리 테이블 (패턴 B) — pagination={false}, expandable
- 자산/라이센스/사용자: 페이징 목록 (패턴 A) — SearchTable + usePagination
- 자산 상세/라이센스 상세: 상세 (패턴 C) — Descriptions + 이력 테이블
- 자산 배정/라이센스 배정: 배정 관리 (패턴 D) — 배정/반납/이관 액션
