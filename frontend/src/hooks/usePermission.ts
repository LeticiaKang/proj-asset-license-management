import { useAuthStore } from '@/store/authStore';
import { useMenuStore, type MenuItem } from '@/store/menuStore';

type Action = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';

export function usePermission() {
  const { user } = useAuthStore(); // 현재 로그인한 사용자의 정보
  const { menus } = useMenuStore();
  
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;

  const findMenu = (menuKey: string): MenuItem | undefined => {
    const search = (items: MenuItem[]): MenuItem | undefined => {
      for (const item of items) {
        if (item.menuUrl === menuKey) return item;
        if (item.children) {
          const found = search(item.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return search(menus);
  };

  
  const hasPermission = (menuKey: string, action: Action): boolean => {
    // 사용자가 'ROLE_ADMIN' 역할을 가지고 있다면, 모든 권한을 가진 것으로 간주하여 무조건 true를 반환
    if (isAdmin) return true;

    // 관리자가 아닐 경우, useMenuStore에 저장된 메뉴 목록을 확인
    const menu = findMenu(menuKey);
    if (!menu?.permissions) return false;

    switch (action) {
      case 'READ':
        return menu.permissions.canRead;
      case 'CREATE':
        return menu.permissions.canCreate;
      case 'UPDATE':
        return menu.permissions.canUpdate;
      case 'DELETE':
        return menu.permissions.canDelete;
      default:
        return false;
    }
  };

  return { hasPermission, isAdmin };
}
