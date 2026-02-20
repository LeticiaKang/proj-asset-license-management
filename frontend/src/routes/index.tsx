import React from 'react';
import {
  LaptopOutlined,
  KeyOutlined,
  TeamOutlined,
  ApartmentOutlined,
  SettingOutlined,
} from '@ant-design/icons';

// ── 라우트 설정 타입 ──
export interface RouteConfig {
  path: string;
  label: string;
  icon?: React.ReactNode;
  /** 이 경로에 접근하기 위해 READ 권한이 필요한 메뉴 키 */
  requiredMenu?: string;
  /** Sider 메뉴에 표시할지 여부 */
  showInMenu?: boolean;
  children?: RouteConfig[];
}

/**
 * 전체 라우트 설정
 * - requiredMenu: 해당 경로에 필요한 메뉴 권한 키 (menuStore의 menuUrl과 매칭)
 * - showInMenu: false이면 Sider에 표시하지 않음 (상세 페이지 등)
 * - 권한 체크 순서: ROLE_ADMIN → 무조건 허용, 그 외 → requiredMenu의 canRead 확인
 */
export const routeConfig: RouteConfig[] = [
  {
    path: '/assets',
    label: '자산 관리',
    icon: <LaptopOutlined />,
    showInMenu: true,
    children: [
      {
        path: '/assets',
        label: '자산 목록',
        requiredMenu: '/assets',
        showInMenu: true,
      },
      {
        path: '/assets/:id',
        label: '자산 상세',
        requiredMenu: '/assets',
        showInMenu: false,
      },
      {
        path: '/asset-assignments',
        label: '자산 배정',
        requiredMenu: '/asset-assignments',
        showInMenu: true,
      },
    ],
  },
  {
    path: '/licenses',
    label: '라이센스 관리',
    icon: <KeyOutlined />,
    showInMenu: true,
    children: [
      {
        path: '/licenses',
        label: '라이센스 목록',
        requiredMenu: '/licenses',
        showInMenu: true,
      },
      {
        path: '/licenses/:id',
        label: '라이센스 상세',
        requiredMenu: '/licenses',
        showInMenu: false,
      },
      {
        path: '/license-assignments',
        label: '라이센스 배정',
        requiredMenu: '/license-assignments',
        showInMenu: true,
      },
    ],
  },
  {
    path: '/members',
    label: '사용자 관리',
    icon: <TeamOutlined />,
    requiredMenu: '/members',
    showInMenu: true,
  },
  {
    path: '/departments',
    label: '부서 관리',
    icon: <ApartmentOutlined />,
    requiredMenu: '/departments',
    showInMenu: true,
  },
  {
    path: '/menus',
    label: '메뉴 관리',
    icon: <SettingOutlined />,
    requiredMenu: '/menus',
    showInMenu: true,
  },
];

/**
 * 라우트 설정에서 특정 path의 requiredMenu를 찾는 유틸
 */
export function findRequiredMenu(path: string): string | undefined {
  for (const route of routeConfig) {
    if (route.path === path) return route.requiredMenu;
    if (route.children) {
      for (const child of route.children) {
        if (child.path === path) return child.requiredMenu;
      }
    }
  }
  return undefined;
}
