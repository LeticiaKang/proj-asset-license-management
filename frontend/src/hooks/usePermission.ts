import { useAuthStore } from '@/store/authStore';
import { useMenuStore, type MenuItem } from '@/store/menuStore';

type Action = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';

export function usePermission() {
  const { user } = useAuthStore();
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
    if (isAdmin) return true;

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
