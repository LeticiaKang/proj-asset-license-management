import { create } from 'zustand';

export interface MenuItem {
  menuId: number;
  menuName: string;
  menuUrl: string;
  parentMenuId: number | null;
  menuIcon: string;
  menuOrder: number;
  children?: MenuItem[];
  permissions?: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}

interface MenuState {
  menus: MenuItem[];
  collapsed: boolean;
  selectedKeys: string[];
  openKeys: string[];
  setMenus: (menus: MenuItem[]) => void;
  setCollapsed: (collapsed: boolean) => void;
  setSelectedKeys: (keys: string[]) => void;
  setOpenKeys: (keys: string[]) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  menus: [],
  collapsed: false,
  selectedKeys: [],
  openKeys: [],

  setMenus: (menus) => set({ menus }),
  setCollapsed: (collapsed) => set({ collapsed }),
  setSelectedKeys: (selectedKeys) => set({ selectedKeys }),
  setOpenKeys: (openKeys) => set({ openKeys }),
}));
