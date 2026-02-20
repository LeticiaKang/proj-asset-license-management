export interface MenuResponse {
  menuId: number;
  parentMenuId: number | null;
  menuName: string;
  menuCode: string;
  menuUrl: string | null;
  menuIcon: string | null;
  menuOrder: number;
  menuDepth: number;
  description: string | null;
  isActive: boolean;
  children: MenuResponse[];
}

export interface MenuRequest {
  parentMenuId?: number | null;
  menuName: string;
  menuCode: string;
  menuUrl?: string;
  menuIcon?: string;
  menuOrder?: number;
  description?: string;
}
