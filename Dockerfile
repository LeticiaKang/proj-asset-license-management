# ============================================================
# Spring Boot Backend - Multi-stage Build
# ============================================================

# ── Stage 1: Build ──
FROM gradle:8.12-jdk17 AS build
WORKDIR /app

# 의존성 캐시 레이어 (소스 변경 시 재다운로드 방지)
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle ./gradle
RUN gradle dependencies --no-daemon 2>/dev/null || true

# 소스 복사 & 빌드
COPY src ./src
RUN gradle bootJar --no-daemon -x test

# ── Stage 2: Runtime ──
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/build/libs/*.jar app.jar

RUN chown appuser:appgroup app.jar
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
