# ============================================================
# React Frontend - Multi-stage Build
# ============================================================

# ── Stage 1: Build ──
FROM node:20-alpine AS build
WORKDIR /app

# 의존성 캐시 레이어
COPY package.json package-lock.json ./
RUN npm ci

# 소스 복사 & 빌드
COPY . .
RUN npm run build

# ── Stage 2: Serve (nginx) ──
FROM nginx:1.27-alpine

# 기본 설정 제거 후 커스텀 설정 복사
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과물 복사
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
