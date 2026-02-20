---
name: react-frontend
description: "React 프론트엔드 코드 생성 스킬. 페이지, 컴포넌트, API 연동 코드를 생성할 때 자동으로 참조. 트리거: React 컴포넌트 생성, 페이지 구현, Ant Design 활용, API 연동 시."
---

# React 프론트엔드 페이지 구현 지침

## 1. 구현 체크리스트 (반드시 이 순서로 진행)

### Step 1: 백엔드 API 확인
- `docs/api-specification.md`에서 해당 도메인의 API 엔드포인트 확인
- Request/Response JSON 스키마, 페이징 여부, 검색 파라미터, 권한 요구사항 확인

### Step 2: 타입 정의 (`src/types/{domain}.types.ts`)
- API 명세의 Response/Request 스키마를 TypeScript interface로 변환
- 검색 조건이 있으면 `{Domain}SearchCondition` 정의
- 파일이 이미 존재하면 부족한 타입만 추가

### Step 3: API 함수 작성 (`src/api/{domain}.api.ts`)
- 기존 `client.ts` import하여 사용 (절대 axios 직접 호출 금지)
- 파일이 이미 존재하면 부족한 함수만 추가

### Step 4: 페이지 컴포넌트 구현 (`src/pages/{domain}/{Domain}Page.tsx`)
- 기존 공통 컴포넌트(`SearchTable`, `FormModal`) 활용
- 권한 기반 렌더링 적용 (`usePermission`)
- React Query로 서버 상태 관리

### Step 5: 라우터 연결 (`src/App.tsx`)
- `PlaceholderPage`를 실제 컴포넌트로 교체
- import 추가, `PermissionRoute` 유지

---

## 2. 프로젝트 구조

```
frontend/src/
├── api/                         # API 클라이언트 (도메인별 파일)
│   ├── client.ts                # axios 인스턴스 (baseURL: /api/v1)
│   ├── auth.api.ts              # 인증 API
│   ├── member.api.ts            # 사용자 API
│   ├── asset.api.ts             # 자산 + 자산배정 API
│   ├── license.api.ts           # 라이센스 + 라이센스배정 API
│   ├── menu.api.ts              # 메뉴 API
│   ├── dept.api.ts              # 부서 API
│   ├── role.api.ts              # 권한 API
│   ├── software.api.ts          # 소프트웨어 API
│   └── code.api.ts              # 공통코드 API
├── components/                  # 공통 컴포넌트
│   ├── layout/
│   │   ├── AppLayout.tsx        # Ant Design Layout + Outlet
│   │   ├── MenuTree.tsx         # 사이드바 메뉴 렌더링
│   │   └── HeaderBar.tsx        # 상단 헤더
│   ├── table/
│   │   └── SearchTable.tsx      # Card 래핑 + 페이징 테이블
│   └── form/
│       └── FormModal.tsx        # Modal + Form (등록/수정 공통)
├── hooks/
│   ├── useAuth.ts               # useLogin, useLogout, useCurrentUser
│   ├── usePermission.ts         # hasPermission(menuKey, action)
│   └── usePagination.ts         # 페이지 상태 관리
├── pages/                       # 라우트 단위 페이지
│   ├── auth/LoginPage.tsx
│   ├── dashboard/DashboardPage.tsx
│   ├── menu/MenuManagePage.tsx
│   ├── role/RoleManagePage.tsx
│   ├── commoncode/CommonCodeManagePage.tsx
│   ├── dept/DeptManagePage.tsx
│   ├── member/MemberManagePage.tsx
│   ├── asset/
│   │   ├── AssetCategoryPage.tsx
│   │   ├── AssetListPage.tsx
│   │   ├── AssetDetailPage.tsx
│   │   └── AssetAssignPage.tsx
│   ├── license/
│   │   ├── SoftwareManagePage.tsx
│   │   ├── LicenseListPage.tsx
│   │   ├── LicenseDetailPage.tsx
│   │   └── LicenseAssignPage.tsx
│   └── error/
│       ├── ForbiddenPage.tsx
│       └── NotFoundPage.tsx
├── routes/
│   ├── index.tsx                # routeConfig 배열 (사이드바 메뉴 구성)
│   └── PermissionRoute.tsx      # 권한 가드 컴포넌트
├── store/                       # Zustand (클라이언트 상태만)
│   ├── authStore.ts             # tokens + user (persist)
│   └── menuStore.ts             # 메뉴 트리 + sidebar 상태
├── types/                       # TypeScript 타입
│   ├── api.types.ts             # ApiResponse<T>, PageResponse<T>, PageRequest
│   ├── auth.types.ts
│   ├── member.types.ts
│   ├── asset.types.ts
│   └── license.types.ts
├── utils/
│   └── constants.ts             # STATUS_COLOR, STATUS_LABEL, PAGE_SIZE, ROUTES 등
├── App.tsx                      # 라우터 정의
└── main.tsx                     # 진입점
```

---

## 3. 공통 타입 참조

```typescript
// api.types.ts
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode?: string;
  timestamp: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;      // 현재 페이지 (0-based)
  size: number;
}

interface PageRequest {
  page?: number;       // 0-based
  size?: number;       // 기본 20
  sort?: string;       // "createdAt,desc"
}

interface SelectOption {
  label: string;
  value: string | number;
}
```

---

## 4. API 함수 작성 패턴

### 비페이징 리스트 (트리 구조: 메뉴, 부서)
```typescript
import client from './client';
import type { ApiResponse } from '@/types/api.types';
import type { MenuResponse, MenuRequest } from '@/types/menu.types';

export const menuApi = {
  getTree: () =>
    client.get<ApiResponse<MenuResponse[]>>('/menus').then((r) => r.data.data),

  getById: (id: number) =>
    client.get<ApiResponse<MenuResponse>>(`/menus/${id}`).then((r) => r.data.data),

  create: (data: MenuRequest) =>
    client.post<ApiResponse<MenuResponse>>('/menus', data).then((r) => r.data.data),

  update: (id: number, data: MenuRequest) =>
    client.put<ApiResponse<MenuResponse>>(`/menus/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    client.delete<ApiResponse<null>>(`/menus/${id}`).then((r) => r.data),
};
```

### 페이징 리스트 (자산, 라이센스, 사용자)
```typescript
export const assetApi = {
  search: (params: AssetSearchCondition & PageRequest) =>
    client
      .get<ApiResponse<PageResponse<AssetResponse>>>('/assets', { params })
      .then((r) => r.data.data),

  getById: (id: number) =>
    client.get<ApiResponse<AssetResponse>>(`/assets/${id}`).then((r) => r.data.data),

  create: (data: AssetRequest) =>
    client.post<ApiResponse<AssetResponse>>('/assets', data).then((r) => r.data.data),

  update: (id: number, data: AssetRequest) =>
    client.put<ApiResponse<AssetResponse>>(`/assets/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    client.delete<ApiResponse<null>>(`/assets/${id}`).then((r) => r.data),
};
```

### 핵심 규칙
- 모든 응답에서 `.then((r) => r.data.data)` 로 ApiResponse 래핑 해제
- delete는 `.then((r) => r.data)` (data가 null이므로)
- API 함수는 `export const {domain}Api = { ... }` 형태 객체 리터럴
- baseURL이 `/api/v1`이므로 경로는 `/assets`, `/menus` 등 상대경로

---

## 5. 타입 정의 패턴

```typescript
// {domain}.types.ts

// 1) 응답 DTO — 서버 응답 필드명과 완전 일치 (camelCase)
export interface MenuResponse {
  menuId: number;
  menuName: string;
  menuCode: string;
  menuUrl: string | null;       // nullable → | null
  menuIcon: string | null;
  menuOrder: number;
  menuDepth: number;
  parentMenuId: number | null;
  description: string | null;
  isActive: boolean;
  children: MenuResponse[];     // 트리 구조 → 재귀 타입
}

// 2) 요청 DTO — 서버 Request 필드와 일치
export interface MenuRequest {
  parentMenuId?: number | null;  // optional = 생략 가능
  menuName: string;              // required = 필수
  menuCode: string;
  menuUrl?: string;
  menuIcon?: string;
  menuOrder?: number;
  description?: string;
}

// 3) 검색 조건 (페이징 도메인만)
export interface MemberSearchCondition {
  keyword?: string;
  deptId?: number;
  employmentStatus?: string;
}
```

---

## 6. 페이지 구현 패턴

### 패턴 A: 페이징 목록 페이지 (자산, 라이센스, 사용자)

```tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Select, Tag, Space, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import SearchTable from '@/components/table/SearchTable';
import FormModal from '@/components/form/FormModal';
import { usePermission } from '@/hooks/usePermission';
import { usePagination } from '@/hooks/usePagination';
import { STATUS_COLOR, STATUS_LABEL } from '@/utils/constants';
import { assetApi } from '@/api/asset.api';
import type { AssetResponse, AssetRequest, AssetSearchCondition } from '@/types/asset.types';

const AssetListPage: React.FC = () => {
  const { message, modal } = App.useApp();
  const { hasPermission } = usePermission();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<AssetRequest>();
  const { page, size, current, onPageChange, resetPage } = usePagination();

  // ── 검색/모달 상태 ──
  const [search, setSearch] = useState<AssetSearchCondition>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // ── 데이터 조회 ──
  const { data, isLoading } = useQuery({
    queryKey: ['assets', page, size, search],
    queryFn: () => assetApi.search({ ...search, page, size }),
  });

  // ── 생성/수정 ──
  const saveMutation = useMutation({
    mutationFn: (values: AssetRequest) =>
      editingId ? assetApi.update(editingId, values) : assetApi.create(values),
    onSuccess: () => {
      message.success(editingId ? '수정되었습니다.' : '등록되었습니다.');
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });

  // ── 삭제 ──
  const deleteMutation = useMutation({
    mutationFn: (id: number) => assetApi.delete(id),
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });

  // ── 컬럼 ──
  const columns: ColumnsType<AssetResponse> = [
    { title: '자산명', dataIndex: 'assetName', key: 'assetName' },
    { title: '제조사', dataIndex: 'manufacturer', key: 'manufacturer' },
    {
      title: '상태',
      dataIndex: 'assetStatus',
      key: 'assetStatus',
      render: (status: string) => (
        <Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status] || status}</Tag>
      ),
    },
    {
      title: '관리',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          {hasPermission('/assets', 'UPDATE') && (
            <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          )}
          {hasPermission('/assets', 'DELETE') && (
            <Button size="small" danger icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.assetId)} />
          )}
        </Space>
      ),
    },
  ];

  // ── 핸들러 ──
  const handleSearch = (values: AssetSearchCondition) => {
    setSearch(values);
    resetPage();
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: AssetResponse) => {
    setEditingId(record.assetId);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    modal.confirm({
      title: '삭제 확인',
      content: '정말 삭제하시겠습니까?',
      okText: '삭제',
      cancelText: '취소',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleSave = () => {
    form.validateFields().then((values) => saveMutation.mutate(values));
  };

  // ── 검색 폼 ──
  const searchForm = (
    <Form layout="inline" onFinish={handleSearch}>
      <Form.Item name="keyword">
        <Input.Search placeholder="검색" allowClear
          onSearch={(v) => handleSearch({ ...search, keyword: v })} />
      </Form.Item>
      <Form.Item name="assetStatus">
        <Select placeholder="상태" allowClear style={{ width: 120 }}>
          <Select.Option value="AVAILABLE">사용가능</Select.Option>
          <Select.Option value="IN_USE">사용중</Select.Option>
        </Select>
      </Form.Item>
    </Form>
  );

  return (
    <>
      <SearchTable<AssetResponse>
        cardTitle="자산 목록"
        extra={
          hasPermission('/assets', 'CREATE') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>등록</Button>
          )
        }
        searchForm={searchForm}
        columns={columns}
        dataSource={data?.content}
        rowKey="assetId"
        loading={isLoading}
        total={data?.totalElements}
        current={current}
        pageSize={size}
        onPageChange={onPageChange}
      />
      <FormModal
        title={editingId ? '수정' : '등록'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saveMutation.isPending}
        form={form}
      >
        {/* Form.Item 들 */}
      </FormModal>
    </>
  );
};

export default AssetListPage;
```

### 패턴 B: 트리 관리 페이지 (메뉴, 부서)

```tsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Table, Form, Input, InputNumber, Select, Space, App, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import FormModal from '@/components/form/FormModal';
import { usePermission } from '@/hooks/usePermission';
import { menuApi } from '@/api/menu.api';
import type { MenuResponse, MenuRequest } from '@/types/menu.types';

const MenuManagePage: React.FC = () => {
  const { message } = App.useApp();
  const { hasPermission } = usePermission();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<MenuRequest>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // ── 트리 데이터 ──
  const { data: menus = [], isLoading } = useQuery({
    queryKey: ['menus'],
    queryFn: () => menuApi.getTree(),
  });

  // ── 부모 Select 옵션 (트리 들여쓰기) ──
  const parentOptions = useMemo(() => {
    const options: { label: string; value: number }[] = [];
    const traverse = (items: MenuResponse[], prefix = '') => {
      for (const item of items) {
        options.push({ label: prefix + item.menuName, value: item.menuId });
        if (item.children?.length) traverse(item.children, prefix + '  ');
      }
    };
    traverse(menus);
    return options;
  }, [menus]);

  // ── Mutations ──
  const saveMutation = useMutation({
    mutationFn: (values: MenuRequest) =>
      editingId ? menuApi.update(editingId, values) : menuApi.create(values),
    onSuccess: () => {
      message.success(editingId ? '수정되었습니다.' : '등록되었습니다.');
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => menuApi.delete(id),
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });

  // ── 컬럼 (트리 테이블) ──
  const columns: ColumnsType<MenuResponse> = [
    { title: '메뉴명', dataIndex: 'menuName', key: 'menuName' },
    { title: '코드', dataIndex: 'menuCode', key: 'menuCode', width: 160 },
    { title: 'URL', dataIndex: 'menuUrl', key: 'menuUrl', width: 180 },
    { title: '순서', dataIndex: 'menuOrder', key: 'menuOrder', width: 80, align: 'center' },
    {
      title: '관리', key: 'action', width: 150,
      render: (_, record) => (
        <Space size="small">
          {hasPermission('/menus', 'CREATE') && (
            <Button size="small" onClick={() => handleAddChild(record.menuId)}>하위추가</Button>
          )}
          {hasPermission('/menus', 'UPDATE') && (
            <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          )}
          {hasPermission('/menus', 'DELETE') && (
            <Popconfirm title="삭제하시겠습니까?" onConfirm={() => deleteMutation.mutate(record.menuId)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const handleAdd = () => { setEditingId(null); form.resetFields(); setModalOpen(true); };
  const handleAddChild = (parentId: number) => {
    setEditingId(null); form.resetFields();
    form.setFieldsValue({ parentMenuId: parentId });
    setModalOpen(true);
  };
  const handleEdit = (record: MenuResponse) => {
    setEditingId(record.menuId); form.setFieldsValue(record); setModalOpen(true);
  };
  const handleSave = () => {
    form.validateFields().then((values) => saveMutation.mutate(values));
  };

  return (
    <>
      <Card
        title="메뉴 관리"
        extra={hasPermission('/menus', 'CREATE') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>메뉴 등록</Button>
        )}
      >
        <Table<MenuResponse>
          columns={columns}
          dataSource={menus}
          rowKey="menuId"
          loading={isLoading}
          pagination={false}                           // 트리는 페이징 없음
          expandable={{ childrenColumnName: 'children' }}
          size="middle"
        />
      </Card>
      <FormModal
        title={editingId ? '메뉴 수정' : '메뉴 등록'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saveMutation.isPending}
        form={form}
      >
        <Form.Item name="parentMenuId" label="상위 메뉴">
          <Select placeholder="최상위 메뉴" allowClear options={parentOptions} />
        </Form.Item>
        <Form.Item name="menuName" label="메뉴명" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        {/* 나머지 Form.Item */}
      </FormModal>
    </>
  );
};

export default MenuManagePage;
```

### 패턴 C: 상세 페이지 (자산 상세, 라이센스 상세)

```tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Descriptions, Button, Tag, Spin, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { STATUS_COLOR, STATUS_LABEL } from '@/utils/constants';

const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['assets', Number(id)],
    queryFn: () => assetApi.getById(Number(id)),
    enabled: !!id,
  });
  if (isLoading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;
  if (!data) return null;

  return (
    <Card title="자산 상세"
      extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>목록</Button>}>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="자산명">{data.assetName}</Descriptions.Item>
        <Descriptions.Item label="상태">
          <Tag color={STATUS_COLOR[data.assetStatus]}>{STATUS_LABEL[data.assetStatus]}</Tag>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
```

### 패턴 D: 배정 관리 페이지 (자산 배정, 라이센스 배정)

```
특수사항:
- 배정/반납/이관 3개 액션 (모달 또는 버튼)
- 사용자별 상세보기 (GET /asset-assignments/members/{memberId})
- 자산/라이센스 Select에서 AVAILABLE 상태 항목만 표시
- modal.confirm()으로 반납/이관 확인
- 배정 상태가 ASSIGNED인 경우만 반납/이관 활성화
```

---

## 7. 공통 컴포넌트 사용법

### SearchTable
```tsx
<SearchTable<T>
  cardTitle="제목"                  // Card 타이틀
  extra={<Button>등록</Button>}     // Card 우측 extra
  searchForm={<Form>...</Form>}     // 검색 폼 (별도 Card로 래핑됨)
  columns={columns}                 // ColumnsType<T>
  dataSource={data?.content}        // T[]
  rowKey="assetId"                  // PK 필드명
  loading={isLoading}
  total={data?.totalElements}       // 전체 건수
  current={current}                 // 1-based (usePagination)
  pageSize={size}
  onPageChange={onPageChange}       // (page, size) => void
/>
```

### FormModal
```tsx
const [form] = Form.useForm<MenuRequest>();

<FormModal
  title={editingId ? '수정' : '등록'}
  open={modalOpen}
  onCancel={() => setModalOpen(false)}
  onOk={() => form.validateFields().then((v) => saveMutation.mutate(v))}
  confirmLoading={saveMutation.isPending}
  form={form}
>
  <Form.Item name="fieldName" label="라벨" rules={[{ required: true }]}>
    <Input />
  </Form.Item>
</FormModal>
```

### usePagination
```tsx
const { page, size, current, onPageChange, resetPage } = usePagination();
// page: 0-based (서버 전송용)
// current: 1-based (Ant Design Table용)
// resetPage(): 검색 조건 변경 시 1페이지로 리셋
```

### usePermission
```tsx
const { hasPermission, isAdmin } = usePermission();
// menuKey = routeConfig의 requiredMenu 값 (/assets, /members 등)
// action = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE'
hasPermission('/assets', 'CREATE');
```

---

## 8. React Query 규칙

```tsx
// 조회
const { data, isLoading } = useQuery({
  queryKey: ['assets', page, size, search],
  queryFn: () => assetApi.search({ ...search, page, size }),
});

// 생성/수정
const saveMutation = useMutation({
  mutationFn: (values: AssetRequest) =>
    editingId ? assetApi.update(editingId, values) : assetApi.create(values),
  onSuccess: () => {
    message.success('저장되었습니다.');
    setModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['assets'] });
  },
});

// 삭제
const deleteMutation = useMutation({
  mutationFn: (id: number) => assetApi.delete(id),
  onSuccess: () => {
    message.success('삭제되었습니다.');
    queryClient.invalidateQueries({ queryKey: ['assets'] });
  },
});
```

### queryKey 네이밍
| 용도 | queryKey |
|------|---------|
| 목록 (페이징) | `['assets', page, size, search]` |
| 단건 상세 | `['assets', id]` |
| 트리 (비페이징) | `['menus']`, `['depts']` |
| 요약/현황 | `['assets', 'summary']` |
| 하위 리소스 | `['licenses', licenseId, 'keys']` |

---

## 9. 상태 표시

```tsx
import { STATUS_COLOR, STATUS_LABEL } from '@/utils/constants';
<Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status] || status}</Tag>
```

| 도메인 | 상태값 |
|--------|--------|
| 자산 | AVAILABLE, IN_USE, REPAIR, DISPOSED, LOST |
| 재직 | ACTIVE, RESIGNED, LEAVE |
| 배정 | ASSIGNED, RETURNED |
| 라이센스키 | AVAILABLE, IN_USE, EXPIRED, REVOKED |

---

## 10. App.tsx 라우터 연결

```tsx
// 1) import 추가
import MenuManagePage from '@/pages/menu/MenuManagePage';

// 2) PlaceholderPage를 실제 컴포넌트로 교체
<Route
  path="menus"
  element={
    <PermissionRoute requiredMenu="/menus">
      <MenuManagePage />
    </PermissionRoute>
  }
/>
```

---

## 11. 메뉴별 구현 명세

### 메뉴 구조 전체
```
대시보드                          /dashboard
시스템 관리
   ├── 메뉴 관리                  /menus
   ├── 권한 관리                  /roles
   └── 공통코드 관리              /common-codes
조직 관리
   ├── 부서 관리                  /departments
   └── 사용자 관리                /members
자산 관리
   ├── 자산 유형 관리             /assets/categories
   ├── 자산 목록                  /assets
   └── 자산 배정                  /asset-assignments
라이센스 관리
   ├── 소프트웨어 관리            /softwares
   ├── 라이센스 목록              /licenses
   └── 라이센스 배정              /license-assignments
```

### 11.1 대시보드 (`/dashboard`)

| 항목 | 값 |
|------|---|
| 페이지 | `pages/dashboard/DashboardPage.tsx` |
| API | `api/asset.api.ts` — getSummary + `api/license.api.ts` — getSummary |
| UI 패턴 | 카드형 요약 (Statistic + 테이블) |
| 특수 기능 | 자산 유형별 현황, 라이센스 수량 현황, 만료 임박 표시 |
| 엔드포인트 | GET `/assets/summary`, GET `/licenses/summary` |

### 11.2 메뉴 관리 (`/menus`)

| 항목 | 값 |
|------|---|
| 페이지 | `pages/menu/MenuManagePage.tsx` |
| API | `api/menu.api.ts` — getTree, getById, create, update, delete |
| 타입 | `types/menu.types.ts` — MenuResponse, MenuRequest |
| UI 패턴 | 트리 테이블 (패턴 B) |
| 특수 기능 | 하위 메뉴 추가, 부모 Select, 아이콘 입력, 순서 관리 |
| 엔드포인트 | GET/POST `/menus`, GET/PUT/DELETE `/menus/{id}` |

### 11.3 권한 관리 (`/roles`)

| 항목 | 값 |
|------|---|
| 페이지 | `pages/role/RoleManagePage.tsx` |
| API | `api/role.api.ts` — getAll, getById, create, update, delete, getMenus, updateMenus |
| 타입 | `types/role.types.ts` — RoleResponse, RoleRequest, RoleMenuResponse, RoleMenuRequest |
| UI 패턴 | 페이징 없는 목록 + 메뉴 권한 설정 모달 |
| 특수 기능 | 메뉴별 CRUD 권한 체크박스 (canRead/canCreate/canUpdate/canDelete) |
| 엔드포인트 | GET/POST `/roles`, GET/PUT/DELETE `/roles/{id}`, GET/PUT `/roles/{id}/menus` |

### 11.4 공통코드 관리 (`/common-codes`)

| 항목 | 값 |
|------|---|
| 페이지 | `pages/commoncode/CommonCodeManagePage.tsx` |
| API | `api/code.api.ts` — getGroups, getByGroup, create, update, delete |
| 타입 | `types/code.types.ts` — CommonCodeResponse, CommonCodeRequest, CodeGroupResponse |
| UI 패턴 | 좌: 그룹 목록 / 우: 코드 목록 (마스터-디테일) |
| 특수 기능 | 그룹 선택 시 코드 목록 필터, 코드 순서 관리 |
| 엔드포인트 | GET `/codes`, GET `/codes/{groupCode}`, POST/PUT/DELETE `/codes` |

### 11.5 부서 관리 (`/departments`)

| 항목 | 값 |
|------|---|
| 페이지 | `pages/dept/DeptManagePage.tsx` |
| API | `api/dept.api.ts` — getTree, getById, create, update, delete, move |
| 타입 | `types/dept.types.ts` — DeptResponse, DeptRequest, DeptMoveRequest |
| UI 패턴 | 트리 테이블 (패턴 B) + 이동 기능 |
| 특수 기능 | 부서 이동 (PUT `/{id}/move`), 최대 5단계 깊이 |
| 엔드포인트 | GET/POST `/depts`, GET/PUT/DELETE `/depts/{id}`, PUT `/depts/{id}/move` |

### 11.6 사용자 관리 (`/members`)

| 항목 | 값 |
|------|---|
| 페이지 | `pages/member/MemberManagePage.tsx` |
| API | `api/member.api.ts` (이미 존재) |
| 타입 | `types/member.types.ts` (이미 존재) |
| UI 패턴 | 페이징 목록 (패턴 A) |
| 검색 조건 | keyword, deptId (부서 Select), employmentStatus (상태 Select) |
| 특수 기능 | 권한 조회/설정 (roles), 부서 Select, 초기 비밀번호 |
| 엔드포인트 | GET/POST `/members`, GET/PUT/DELETE `/members/{id}`, GET/PUT `/{id}/roles` |

### 11.7 자산 유형 관리 (`/assets/categories`)

| 항목 | 값 |
|------|---|
| 페이지 | `pages/asset/AssetCategoryPage.tsx` |
| API | `api/asset.api.ts` — assetCategoryApi (추가 필요) |
| 타입 | `types/asset.types.ts` — AssetCategoryResponse, AssetCategoryRequest |
| UI 패턴 | 단순 목록 + FormModal |
| 특수 기능 | 카테고리 CRUD, 순서 관리 |
| 엔드포인트 | GET/POST `/assets/categories`, PUT/DELETE `/assets/categories/{id}` |

### 11.8 자산 목록 (`/assets`)

| 항목 | 값 |
|------|---|
| 페이지 | `pages/asset/AssetListPage.tsx` |
| API | `api/asset.api.ts` (이미 존재) |
| 타입 | `types/asset.types.ts` (이미 존재) |
| UI 패턴 | 페이징 목록 (패턴 A) |
| 검색 조건 | keyword, categoryId, assetStatus |
| 특수 기능 | 카테고리 Select, 상세 페이지 이동, JSONB specs |
| 엔드포인트 | GET/POST `/assets`, GET/PUT/DELETE `/assets/{id}`, GET `/assets/summary`, `/{id}/history` |

### 11.9 자산 상세 (`/assets/:id`)

| 항목 | 값 |
|------|---|
| 페이지 | `pages/asset/AssetDetailPage.tsx` |
| UI 패턴 | 상세 (패턴 C) |
| 특수 기능 | Descriptions 상세, 배정 이력 테이블, 스펙(JSONB) 표시 |

### 11.10 자산 배정 (`/asset-assignments`)

| 항목 | 값 |
|------|---|
| 페이지 | `pages/asset/AssetAssignPage.tsx` |
| API | `api/asset.api.ts` — assetAssignmentApi (이미 존재) |
| UI 패턴 | 배정 관리 (패턴 D) |
| 특수 기능 | 배정/반납/이관, 사용자별 상세보기, AVAILABLE 자산만 배정 |
| 엔드포인트 | GET/POST `/asset-assignments`, GET `/members/{id}`, PUT `/{id}/return`, `/{id}/transfer` |

### 11.11 소프트웨어 관리 (`/softwares`)

| 항목 | 값 |
|------|---|
| 페이지 | `pages/license/SoftwareManagePage.tsx` |
| API | `api/software.api.ts` — getAll, getById, create, update |
| 타입 | `types/software.types.ts` — SoftwareResponse, SoftwareRequest |
| UI 패턴 | 단순 목록 + FormModal |
| 특수 기능 | 소프트웨어 CRUD (삭제 없음), 라이센스 연결 |
| 엔드포인트 | GET/POST `/softwares`, GET/PUT `/softwares/{id}` |

### 11.12 라이센스 목록 (`/licenses`)

| 항목 | 값 |
|------|---|
| 페이지 | `pages/license/LicenseListPage.tsx` |
| API | `api/license.api.ts` (이미 존재) |
| 타입 | `types/license.types.ts` (이미 존재) |
| UI 패턴 | 페이징 목록 (패턴 A) |
| 검색 조건 | keyword, licenseType, softwareId |
| 특수 기능 | 수량 표시 (used/total), 소프트웨어 Select, 상세 이동 |

### 11.13 라이센스 상세 (`/licenses/:id`)

| 항목 | 값 |
|------|---|
| 페이지 | `pages/license/LicenseDetailPage.tsx` |
| UI 패턴 | 상세 (패턴 C) + 키 관리 테이블 |
| 특수 기능 | 라이센스 키 CRUD, 키 상태 관리, 설치 가이드, 수량 현황 |
| 엔드포인트 | GET `/licenses/{id}`, GET/POST `/licenses/{id}/keys`, PUT `/licenses/keys/{keyId}` |

### 11.14 라이센스 배정 (`/license-assignments`)

| 항목 | 값 |
|------|---|
| 페이지 | `pages/license/LicenseAssignPage.tsx` |
| API | `api/license.api.ts` — licenseAssignmentApi (이미 존재) |
| UI 패턴 | 배정 관리 (패턴 D) |
| 특수 기능 | 유형별 분기 (VOLUME/INDIVIDUAL/SUBSCRIPTION), 키 선택, 수량 체크 |
| 엔드포인트 | GET/POST `/license-assignments`, PUT `/{id}/return`, PUT `/{id}` |

---

## 12. Ant Design 컴포넌트 매핑

| 기능 | 컴포넌트 | 비고 |
|------|----------|------|
| 목록 테이블 | `<Table>` + ColumnsType | SearchTable로 래핑 |
| 트리 테이블 | `<Table expandable>` | `childrenColumnName: 'children'`, `pagination={false}` |
| 검색 필터 | `<Form layout="inline">` | Card로 래핑 |
| 등록/수정 모달 | `<Modal>` + `<Form>` | FormModal로 래핑 |
| 상세 정보 | `<Descriptions bordered>` | `column={2}` |
| 상태 Tag | `<Tag color={...}>` | STATUS_COLOR 매핑 |
| 확인 다이얼로그 | `modal.confirm()` | `App.useApp()` |
| 알림 | `message.success/error()` | `App.useApp()` |
| 인라인 삭제 확인 | `<Popconfirm>` | 트리 테이블에서 사용 |
| 날짜 | `<DatePicker>` | dayjs |
| 숫자 | `<InputNumber>` | min/max |
| 텍스트 영역 | `<Input.TextArea>` | rows |

---

## 13. 주의사항

- 모든 API 호출은 `api/` 폴더 함수 통해서만 (직접 axios 호출 금지)
- 서버 상태: React Query / 클라이언트 상태: Zustand (혼용 금지)
- 한국어 UI (메뉴명, 버튼, 메시지, placeholder 전부 한국어)
- 반응형 불필요 (관리자 전용 데스크톱 웹)
- `App.useApp()`으로 message/modal 사용 (antd 정적 메서드 금지)
- Form은 `Form.useForm<타입>()` 으로 타입 지정
- 컬럼의 `key`는 `dataIndex`와 동일하게
- 날짜는 string (ISO format)으로 서버 전송
- 삭제 전 confirm/popconfirm 필수
- 트리 데이터는 `pagination={false}`
- rowKey는 PK 필드명 (menuId, deptId, memberId, assetId 등)
