# Asset & License Management System

회사 자산(모니터, 데스크톱, 노트북)과 소프트웨어 라이센스를 통합 관리하는 시스템

## 기술 스택

### Backend
- Java 17
- Spring Boot 3.2.x
- MyBatis
- Spring Security + JWT
- PostgreSQL 15

### Frontend
- Vue 3
- TypeScript
- Tailwind CSS
- Pinia (상태관리)
- Vite

### Infrastructure
- Docker
- Docker Compose

## 시작하기

### 사전 요구사항
- Docker
- Docker Compose

### 설치 및 실행

1. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 열어서 필요한 값들을 수정하세요
```

2. Docker 컨테이너 실행
```bash
docker-compose up -d
```

3. 로그 확인
```bash
docker-compose logs -f
```

4. 애플리케이션 접속
- Frontend: http://localhost:5173
- Backend API: http://localhost:8090
- PostgreSQL: localhost:5432
- pgAdmin: http://localhost:5050

### 기본 계정 정보
- 사용자명: admin
- 비밀번호: admin123

## 주요 기능

### 자산 관리
- 자산 등록/수정/삭제
- 자산 배정/회수
- 자산 히스토리 조회
- 자산 검색/필터링

### 라이센스 관리
- 라이센스 등록/수정/삭제
- 라이센스 할당/회수
- 라이센스 현황 대시보드
- 만료 임박 알림

### 사용자 관리
- 사용자 등록/수정/삭제
- 역할 관리 (최고관리자, 인사담당자, 자산관리자, 소프트웨어관리자, 일반사용자)
- 메뉴 권한 관리

## 프로젝트 구조
```
asset-license-management/
├── docker/              # Docker 설정
│   ├── postgres/        # PostgreSQL 초기화 스크립트
│   ├── backend/         # Backend Dockerfile
│   └── frontend/        # Frontend Dockerfile
├── backend/             # Spring Boot 백엔드
│   ├── src/
│   ├── build.gradle
│   └── settings.gradle
├── frontend/            # Vue 3 프론트엔드
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## 개발 가이드

### Backend 개발
```bash
cd backend
./gradlew bootRun
```

### Frontend 개발
```bash
cd frontend
npm install
npm run dev
```

### 데이터베이스 초기화
```bash
docker-compose down -v
docker-compose up -d
```

## 데이터베이스 스키마

### 주요 테이블
- `user` - 사용자 정보
- `role` - 역할 정보
- `department` - 부서 정보
- `menu` - 메뉴 정보
- `asset` - 자산 정보
- `asset_history` - 자산 이력
- `license` - 라이센스 정보
- `license_assignment` - 라이센스 할당
- `license_history` - 라이센스 이력

자세한 스키마는 `docker/postgres/init/01_create_tables.sql` 참조

## API 문서

API 엔드포인트는 `/api` 경로 아래에 구성됩니다.

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃

### 자산 관리
- `GET /api/assets` - 자산 목록 조회
- `GET /api/assets/{id}` - 자산 상세 조회
- `POST /api/assets` - 자산 등록
- `PUT /api/assets/{id}` - 자산 수정
- `DELETE /api/assets/{id}` - 자산 삭제

### 라이센스 관리
- `GET /api/licenses` - 라이센스 목록 조회
- `GET /api/licenses/{id}` - 라이센스 상세 조회
- `POST /api/licenses` - 라이센스 등록
- `PUT /api/licenses/{id}` - 라이센스 수정
- `DELETE /api/licenses/{id}` - 라이센스 삭제

### 사용자 관리
- `GET /api/users` - 사용자 목록 조회
- `GET /api/users/{id}` - 사용자 상세 조회
- `POST /api/users` - 사용자 등록
- `PUT /api/users/{id}` - 사용자 수정
- `DELETE /api/users/{id}` - 사용자 삭제

## 트러블슈팅

### 포트 충돌 시
`docker-compose.yml` 파일에서 포트를 변경하세요.

### 데이터베이스 연결 오류
1. PostgreSQL 컨테이너가 정상 실행 중인지 확인
```bash
docker-compose ps
```

2. 환경 변수가 올바르게 설정되었는지 확인
```bash
cat .env
```

### 프론트엔드 빌드 오류
```bash
cd frontend
rm -rf node_modules
npm install
```

## License
MIT
