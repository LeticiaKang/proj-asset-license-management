import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMenuStore, type MenuItem } from '@/store/menuStore';
import ForbiddenPage from '@/pages/error/ForbiddenPage';

interface PermissionRouteProps {
  /** menuStore의 menuUrl과 매칭되는 권한 키 */
  requiredMenu?: string;
  children: React.ReactNode;
}

/**
 * 권한 기반 라우트 가드
 *
 * - requiredMenu가 없으면 인증만 되어 있으면 통과 (change-password 등)
 * - ROLE_ADMIN이면 무조건 통과
 * - 그 외: menuStore에서 해당 메뉴의 canRead 권한 확인
 * - 메뉴 데이터가 아직 로드되지 않았으면 (menus.length === 0) 통과 (로딩 중)
 */
const PermissionRoute: React.FC<PermissionRouteProps> = ({
  requiredMenu,
  children,
}) => {
  const user = useAuthStore((s) => s.user);
  const menus = useMenuStore((s) => s.menus);

  // 권한 키가 없으면 로그인만 되어 있으면 통과
  if (!requiredMenu) {
    return <>{children}</>;
  }

  // ROLE_ADMIN은 무조건 통과
  if (user?.roles?.includes('ROLE_ADMIN')) {
    return <>{children}</>;
  }

  // 메뉴 데이터가 아직 로드 안 된 경우 일단 통과 (로딩 중)
  if (menus.length === 0) {
    return <>{children}</>;
  }

  // 메뉴 트리에서 해당 menuUrl을 가진 항목 찾기
  const hasReadPermission = checkMenuPermission(menus, requiredMenu);

  if (!hasReadPermission) {
    return <ForbiddenPage />;
  }

  return <>{children}</>;
};

function checkMenuPermission(menus: MenuItem[], menuUrl: string): boolean {
  for (const menu of menus) {
    if (menu.menuUrl === menuUrl) {
      return menu.permissions?.canRead ?? false;
    }
    if (menu.children) {
      const found = checkMenuPermission(menu.children, menuUrl);
      if (found) return true;
    }
  }
  return false;
}

export default PermissionRoute;
