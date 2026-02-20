import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import AppLayout from '@/components/layout/AppLayout';
import PermissionRoute from '@/routes/PermissionRoute';
import LoginPage from '@/pages/auth/LoginPage';
import ForbiddenPage from '@/pages/error/ForbiddenPage';
import NotFoundPage from '@/pages/error/NotFoundPage';

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

// 페이지 placeholder (추후 /generate-page로 구현)
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div>
    <h2>{title}</h2>
    <p>페이지 구현 예정</p>
  </div>
);

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
                <Route index element={<Navigate to="/assets" replace />} />

                {/* 권한 불필요 (인증만) */}
                <Route
                  path="change-password"
                  element={<PlaceholderPage title="비밀번호 변경" />}
                />

                {/* 자산 관리 */}
                <Route
                  path="assets"
                  element={
                    <PermissionRoute requiredMenu="/assets">
                      <PlaceholderPage title="자산 목록" />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="assets/:id"
                  element={
                    <PermissionRoute requiredMenu="/assets">
                      <PlaceholderPage title="자산 상세" />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="asset-assignments"
                  element={
                    <PermissionRoute requiredMenu="/asset-assignments">
                      <PlaceholderPage title="자산 배정" />
                    </PermissionRoute>
                  }
                />

                {/* 라이센스 관리 */}
                <Route
                  path="licenses"
                  element={
                    <PermissionRoute requiredMenu="/licenses">
                      <PlaceholderPage title="라이센스 목록" />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="licenses/:id"
                  element={
                    <PermissionRoute requiredMenu="/licenses">
                      <PlaceholderPage title="라이센스 상세" />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="license-assignments"
                  element={
                    <PermissionRoute requiredMenu="/license-assignments">
                      <PlaceholderPage title="라이센스 배정" />
                    </PermissionRoute>
                  }
                />

                {/* 사용자/부서/메뉴 관리 */}
                <Route
                  path="members"
                  element={
                    <PermissionRoute requiredMenu="/members">
                      <PlaceholderPage title="사용자 관리" />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="departments"
                  element={
                    <PermissionRoute requiredMenu="/departments">
                      <PlaceholderPage title="부서 관리" />
                    </PermissionRoute>
                  }
                />
                <Route
                  path="menus"
                  element={
                    <PermissionRoute requiredMenu="/menus">
                      <PlaceholderPage title="메뉴 관리" />
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
