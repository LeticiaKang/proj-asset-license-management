import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { title: '로그인' },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { title: '대시보드' },
    },

    // 사용자 관리
    {
      path: '/user',
      name: 'UserList',
      component: () => import('@/views/user/UserList.vue'),
      meta: { title: '사용자 관리' },
    },
    {
      path: '/user/create',
      name: 'UserCreate',
      component: () => import('@/views/user/UserCreate.vue'),
      meta: { title: '사용자 등록' },
    },
    {
      path: '/user/:userId/edit',
      name: 'UserEdit',
      component: () => import('@/views/user/UserEdit.vue'),
      meta: { title: '사용자 수정' },
    },

    // 부서 관리
    {
      path: '/department',
      name: 'DepartmentList',
      component: () => import('@/views/department/DepartmentList.vue'),
      meta: { title: '부서 관리' },
    },
    {
      path: '/department/create',
      name: 'DepartmentCreate',
      component: () => import('@/views/department/DepartmentCreate.vue'),
      meta: { title: '부서 등록' },
    },

    // 자산 관리
    {
      path: '/asset',
      name: 'AssetList',
      component: () => import('@/views/asset/AssetList.vue'),
      meta: { title: '자산 목록' },
    },
    {
      path: '/asset/usage',
      name: 'AssetUsageList',
      component: () => import('@/views/asset/AssetUsageList.vue'),
      meta: { title: '자산 사용 현황' },
    },
    {
      path: '/asset/create',
      name: 'AssetCreate',
      component: () => import('@/views/asset/AssetCreate.vue'),
      meta: { title: '자산 등록' },
    },
    {
      path: '/asset/:assetId/edit',
      name: 'AssetEdit',
      component: () => import('@/views/asset/AssetEdit.vue'),
      meta: { title: '자산 수정' },
    },

    // 라이센스 관리
    {
      path: '/license',
      name: 'LicenseList',
      component: () => import('@/views/license/LicenseList.vue'),
      meta: { title: '라이센스 목록' },
    },
    {
      path: '/license/usage',
      name: 'LicenseUsageList',
      component: () => import('@/views/license/LicenseUsageList.vue'),
      meta: { title: '라이센스 사용 현황' },
    },
    {
      path: '/license/create',
      name: 'LicenseCreate',
      component: () => import('@/views/license/LicenseCreate.vue'),
      meta: { title: '라이센스 등록' },
    },
    {
      path: '/license/:licenseId/edit',
      name: 'LicenseEdit',
      component: () => import('@/views/license/LicenseEdit.vue'),
      meta: { title: '라이센스 수정' },
    },

    // 시스템 관리
    {
      path: '/system/menu',
      name: 'MenuManagement',
      component: () => import('@/views/system/MenuManagement.vue'),
      meta: { title: '메뉴 관리' },
    },
    {
      path: '/system/role',
      name: 'RoleManagement',
      component: () => import('@/views/system/RoleManagement.vue'),
      meta: { title: '권한 목록' },
    },
    {
      path: '/system/role-menu',
      name: 'RoleMenuManagement',
      component: () => import('@/views/system/RoleMenuManagement.vue'),
      meta: { title: '메뉴별 권한 관리' },
    },
    {
      path: '/system/user-role',
      name: 'UserRoleManagement',
      component: () => import('@/views/system/UserRoleManagement.vue'),
      meta: { title: '사용자별 권한 관리' },
    },
  ],
})

export default router
