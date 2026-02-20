import React, { useMemo } from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useMenuStore, type MenuItem as StoreMenuItem } from '@/store/menuStore';
import { routeConfig, type RouteConfig } from '@/routes';
import type { MenuProps } from 'antd';
import type { ItemType } from 'antd/es/menu/interface';

/**
 * Sider 메뉴 트리
 *
 * 렌더링 로직:
 * 1. ROLE_ADMIN → routeConfig의 showInMenu=true 전체 표시
 * 2. 그 외 → menuStore에 로드된 메뉴 + canRead=true인 항목만 표시
 * 3. 메뉴 데이터 미로드 시 (menus.length === 0) → routeConfig 전체 표시 (로딩 중)
 */
const MenuTree: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const menus = useMenuStore((s) => s.menus);
  const { selectedKeys, setSelectedKeys, openKeys, setOpenKeys } = useMenuStore();

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;

  // 권한 기반 메뉴 필터링
  const menuItems = useMemo<ItemType[]>(() => {
    // 관리자이거나 메뉴 데이터가 아직 없으면 전체 표시
    if (isAdmin || menus.length === 0) {
      return buildMenuFromConfig(routeConfig);
    }

    // 일반 사용자: menuStore 권한 기반 필터링
    return buildMenuFromConfig(
      routeConfig,
      (route) => hasReadAccess(menus, route.requiredMenu),
    );
  }, [isAdmin, menus]);

  const handleClick: MenuProps['onClick'] = ({ key }: { key: string }) => {
    setSelectedKeys([key]);
    navigate(key);
  };

  // 현재 URL에서 선택 상태 추론
  const currentSelectedKeys =
    selectedKeys.length > 0 ? selectedKeys : [location.pathname];

  // 현재 URL에서 openKeys 추론 (첫 렌더 시)
  const defaultOpenKeys = useMemo(() => {
    if (openKeys.length > 0) return openKeys;
    for (const route of routeConfig) {
      if (route.children?.some((c) => c.path === location.pathname)) {
        return [route.path];
      }
    }
    return [];
  }, [openKeys, location.pathname]);

  return (
    <Menu
      mode="inline"
      selectedKeys={currentSelectedKeys}
      openKeys={defaultOpenKeys}
      onOpenChange={setOpenKeys}
      onClick={handleClick}
      items={menuItems}
      style={{ borderRight: 0 }}
    />
  );
};

// ── routeConfig → Ant Design Menu items 변환 ──
function buildMenuFromConfig(
  routes: RouteConfig[],
  filter?: (route: RouteConfig) => boolean,
): ItemType[] {
  const items: ItemType[] = [];

  for (const route of routes) {
    if (!route.showInMenu) continue;

    if (route.children) {
      // 하위 메뉴 중 표시 가능한 항목 필터링
      const visibleChildren = route.children.filter((child) => {
        if (!child.showInMenu) return false;
        if (!filter) return true;
        return filter(child);
      });

      // 하위 메뉴가 모두 숨겨지면 부모도 숨김
      if (visibleChildren.length === 0) continue;

      items.push({
        key: route.path,
        icon: route.icon,
        label: route.label,
        children: visibleChildren.map((child) => ({
          key: child.path,
          label: child.label,
        })),
      });
    } else {
      // 단일 메뉴: 필터 적용
      if (filter && !filter(route)) continue;

      items.push({
        key: route.path,
        icon: route.icon,
        label: route.label,
      });
    }
  }

  return items;
}

// ── menuStore에서 canRead 권한 확인 ──
function hasReadAccess(
  menus: StoreMenuItem[],
  menuUrl?: string,
): boolean {
  if (!menuUrl) return true;

  for (const menu of menus) {
    if (menu.menuUrl === menuUrl) {
      return menu.permissions?.canRead ?? false;
    }
    if (menu.children) {
      const found = hasReadAccess(menu.children, menuUrl);
      if (found) return true;
    }
  }
  return false;
}

export default MenuTree;
