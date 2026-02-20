// ── 상태값 색상 매핑 (Ant Design <Tag color>) ──
export const STATUS_COLOR: Record<string, string> = {
  AVAILABLE: 'green',
  IN_USE: 'blue',
  REPAIR: 'orange',
  DISPOSED: 'red',
  LOST: 'gray',
  ACTIVE: 'green',
  RESIGNED: 'red',
  LEAVE: 'orange',
  ASSIGNED: 'blue',
  RETURNED: 'default',
  EXPIRED: 'red',
  REVOKED: 'volcano',
};

// ── 상태값 한국어 라벨 ──
export const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: '사용가능',
  IN_USE: '사용중',
  REPAIR: '수리중',
  DISPOSED: '폐기',
  LOST: '분실',
  ACTIVE: '재직',
  RESIGNED: '퇴사',
  LEAVE: '휴직',
  ASSIGNED: '배정',
  RETURNED: '반납',
  EXPIRED: '만료',
  REVOKED: '폐기',
};

// ── 라이센스 유형 라벨 ──
export const LICENSE_TYPE_LABEL: Record<string, string> = {
  VOLUME: '볼륨',
  INDIVIDUAL: '개별',
  SUBSCRIPTION: '구독',
};

// ── 이력 액션 타입 라벨 ──
export const ACTION_TYPE_LABEL: Record<string, string> = {
  ASSIGN: '배정',
  RETURN: '반납',
  TRANSFER: '이관',
  EXPIRE: '만료',
};

// ── 라우트 경로 ──
export const ROUTES = {
  LOGIN: '/login',
  CHANGE_PASSWORD: '/change-password',
  ASSETS: '/assets',
  ASSET_DETAIL: '/assets/:id',
  ASSET_ASSIGNMENTS: '/asset-assignments',
  LICENSES: '/licenses',
  LICENSE_DETAIL: '/licenses/:id',
  LICENSE_ASSIGNMENTS: '/license-assignments',
  MEMBERS: '/members',
  DEPARTMENTS: '/departments',
  MENUS: '/menus',
} as const;

// ── 페이징 ──
export const PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ── 브레드크럼 매핑 ──
export const BREADCRUMB_MAP: Record<string, string> = {
  '/assets': '자산 목록',
  '/asset-assignments': '자산 배정',
  '/licenses': '라이센스 목록',
  '/license-assignments': '라이센스 배정',
  '/members': '사용자 관리',
  '/departments': '부서 관리',
  '/menus': '메뉴 관리',
  '/change-password': '비밀번호 변경',
};
