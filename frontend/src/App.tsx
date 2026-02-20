import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import AppLayout from '@/components/layout/AppLayout';
import PermissionRoute from '@/routes/PermissionRoute';
import LoginPage from '@/pages/auth/LoginPage';
import ChangePasswordPage from '@/pages/auth/ChangePasswordPage';
import ForbiddenPage from '@/pages/error/ForbiddenPage';
import NotFoundPage from '@/pages/error/NotFoundPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import MenuManagePage from '@/pages/menu/MenuManagePage';
import RoleManagePage from '@/pages/role/RoleManagePage';
import CommonCodeManagePage from '@/pages/commoncode/CommonCodeManagePage';
import DeptManagePage from '@/pages/dept/DeptManagePage';
import MemberManagePage from '@/pages/member/MemberManagePage';
import AssetCategoryPage from '@/pages/asset/AssetCategoryPage';
import AssetListPage from '@/pages/asset/AssetListPage';
import AssetDetailPage from '@/pages/asset/AssetDetailPage';
import AssetAssignPage from '@/pages/asset/AssetAssignPage';
import SoftwareManagePage from '@/pages/license/SoftwareManagePage';
import LicenseListPage from '@/pages/license/LicenseListPage';
import LicenseDetailPage from '@/pages/license/LicenseDetailPage';
import LicenseAssignPage from '@/pages/license/LicenseAssignPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
    },
  },
});

// ── 인증 가드: 미로그인 → /login ──
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// ── 로그인 페이지 가드: 이미 로그인 → / ──
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={koKR} theme={{ token: { borderRadius: 6 } }}>
        <AntApp>
          <BrowserRouter>
            <Routes>
              {/* ── 비인증 라우트 ── */}
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                }
              />

              {/* ── 인증 필요 라우트 (AppLayout 적용) ── */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* 권한 불필요 (인증만) */}
                <Route path="change-password" element={<ChangePasswordPage />} />

                {/* 대시보드 */}
                <Route path="dashboard" element={<DashboardPage />} />

                {/* 시스템 관리 */}
                <Route
                  path="menus"
                  element={
                    <PermissionRoute requiredMenu="/menus">
                      <MenuManagePage />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="roles"
                  element={
                    <PermissionRoute requiredMenu="/roles">
                      <RoleManagePage />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="common-codes"
                  element={
                    <PermissionRoute requiredMenu="/common-codes">
                      <CommonCodeManagePage />
                    </PermissionRoute>
                  }
                />

                {/* 조직 관리 */}
                <Route
                  path="departments"
                  element={
                    <PermissionRoute requiredMenu="/departments">
                      <DeptManagePage />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="members"
                  element={
                    <PermissionRoute requiredMenu="/members">
                      <MemberManagePage />
                    </PermissionRoute>
                  }
                />

                {/* 자산 관리 */}
                <Route
                  path="assets/categories"
                  element={
                    <PermissionRoute requiredMenu="/assets/categories">
                      <AssetCategoryPage />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="assets"
                  element={
                    <PermissionRoute requiredMenu="/assets">
                      <AssetListPage />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="assets/:id"
                  element={
                    <PermissionRoute requiredMenu="/assets">
                      <AssetDetailPage />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="asset-assignments"
                  element={
                    <PermissionRoute requiredMenu="/asset-assignments">
                      <AssetAssignPage />
                    </PermissionRoute>
                  }
                />

                {/* 라이센스 관리 */}
                <Route
                  path="softwares"
                  element={
                    <PermissionRoute requiredMenu="/softwares">
                      <SoftwareManagePage />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="licenses"
                  element={
                    <PermissionRoute requiredMenu="/licenses">
                      <LicenseListPage />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="licenses/:id"
                  element={
                    <PermissionRoute requiredMenu="/licenses">
                      <LicenseDetailPage />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="license-assignments"
                  element={
                    <PermissionRoute requiredMenu="/license-assignments">
                      <LicenseAssignPage />
                    </PermissionRoute>
                  }
                />

                {/* 403 직접 접근 */}
                <Route path="forbidden" element={<ForbiddenPage />} />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* 최상위 404 → 로그인 또는 홈으로 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
