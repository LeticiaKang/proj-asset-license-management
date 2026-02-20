import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { useAuthStore } from '@/store/authStore';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const client = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request 인터셉터: JWT 토큰 자동 첨부 ──
client.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response 인터셉터: 401 refresh, 에러 핸들링 ──
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

const processQueue = (token: string) => {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
};

const rejectQueue = () => {
  pendingRequests = [];
};

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; errorCode?: string }>) => {
    const originalRequest = error.config as RetryConfig | undefined;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;

    // ── 401: 토큰 갱신 시도 ──
    if (status === 401 && !originalRequest._retry) {
      const refreshToken = useAuthStore.getState().refreshToken;

      // refresh token이 없으면 즉시 로그아웃
      if (!refreshToken) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // 이미 refresh 진행 중이면 큐에 대기
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(client(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post('/api/v1/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        useAuthStore.getState().setTokens(accessToken, newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(accessToken);
        return client(originalRequest);
      } catch {
        rejectQueue();
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 403: 권한 없음 ──
    if (status === 403) {
      message.error('접근 권한이 없습니다.');
      return Promise.reject(error);
    }

    // ── 그 외 에러: 메시지 표시 (auth 엔드포인트는 호출부에서 처리하므로 제외) ──
    const isAuthEndpoint = originalRequest.url?.startsWith('/auth/');
    if (!isAuthEndpoint) {
      const errorMessage =
        error.response?.data?.message || '오류가 발생했습니다.';
      message.error(errorMessage);
    }

    return Promise.reject(error);
  },
);

export default client;
