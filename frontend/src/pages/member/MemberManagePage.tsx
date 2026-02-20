import React, { useState } from 'react';
import { Button, Form, Input, Modal, Select, DatePicker, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LogoutOutlined, SafetyOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import SearchTable from '@/components/table/SearchTable';
import FormModal from '@/components/form/FormModal';
import { memberApi } from '@/api/member.api';
import { deptApi } from '@/api/dept.api';
import { roleApi } from '@/api/role.api';
import { usePagination } from '@/hooks/usePagination';
import { usePermission } from '@/hooks/usePermission';
import { STATUS_COLOR, STATUS_LABEL } from '@/utils/constants';
import type { MemberResponse, MemberRequest, MemberSearchCondition } from '@/types/member.types';
import type { DeptResponse } from '@/types/dept.types';

const MemberManagePage: React.FC = () => {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const { page, size, current, onPageChange, resetPage } = usePagination();
  const [form] = Form.useForm<MemberRequest>();
  const [searchForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState<MemberSearchCondition>({});
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleTargetId, setRoleTargetId] = useState<number | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['members', page, size, search],
    queryFn: () => memberApi.search({ ...search, page, size }),
  });

  const { data: deptTree = [] } = useQuery({
    queryKey: ['depts'],
    queryFn: deptApi.getTree,
  });

  const flattenDepts = (items: DeptResponse[], depth = 0): { label: string; value: number }[] => {
    const result: { label: string; value: number }[] = [];
    items.forEach((item) => {
      result.push({ label: `${'ㄴ'.repeat(depth)} ${item.deptName}`.trim(), value: item.deptId });
      if (item.children?.length) {
        result.push(...flattenDepts(item.children, depth + 1));
      }
    });
    return result;
  };

  const deptOptions = flattenDepts(deptTree);

  const saveMutation = useMutation({
    mutationFn: (values: MemberRequest) =>
      editingId ? memberApi.update(editingId, values) : memberApi.create(values),
    onSuccess: () => {
      message.success(editingId ? '수정되었습니다.' : '등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: memberApi.delete,
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const resignMutation = useMutation({
    mutationFn: ({ id, resignDate }: { id: number; resignDate: string }) =>
      memberApi.resign(id, resignDate),
    onSuccess: () => {
      message.success('퇴사 처리가 완료되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: roleApi.getAll,
    enabled: roleModalOpen,
  });

  const roleMutation = useMutation({
    mutationFn: ({ memberId, roleIds }: { memberId: number; roleIds: number[] }) =>
      memberApi.updateRoles(memberId, { roleIds }),
    onSuccess: () => {
      message.success('권한이 설정되었습니다.');
      setRoleModalOpen(false);
    },
  });

  const openRoleModal = async (memberId: number) => {
    setRoleTargetId(memberId);
    const memberRoles = await memberApi.getRoles(memberId);
    setSelectedRoleIds(memberRoles.map((r) => r.roleId));
    setRoleModalOpen(true);
  };

  const handleRoleSave = () => {
    if (roleTargetId) {
      roleMutation.mutate({ memberId: roleTargetId, roleIds: selectedRoleIds });
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = async (id: number) => {
    const detail = await memberApi.getById(id);
    setEditingId(id);
    form.setFieldsValue({
      loginId: detail.loginId,
      memberName: detail.memberName,
      deptId: detail.deptId,
      position: detail.position,
      jobTitle: detail.jobTitle,
      hireDate: detail.hireDate,
      workLocation: detail.workLocation,
      email: detail.email,
      phone: detail.phone,
    });
    setModalOpen(true);
  };

  const handleResign = (id: number) => {
    let resignDate = '';
    modal.confirm({
      title: '퇴사 처리',
      content: (
        <DatePicker
          style={{ width: '100%', marginTop: 8 }}
          placeholder="퇴사일 선택"
          onChange={(_, dateStr) => {
            resignDate = dateStr as string;
          }}
        />
      ),
      okText: '퇴사 처리',
      cancelText: '취소',
      onOk: () => {
        if (!resignDate) {
          message.warning('퇴사일을 선택하세요.');
          return Promise.reject();
        }
        return resignMutation.mutateAsync({ id, resignDate });
      },
    });
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    saveMutation.mutate(values);
  };

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    setSearch(values);
    resetPage();
  };

  const handleReset = () => {
    searchForm.resetFields();
    setSearch({});
    resetPage();
  };

  const positionOptions = [
    { label: '인턴', value: 'INTERN' },
    { label: '사원', value: 'STAFF' },
    { label: '주임', value: 'SENIOR' },
    { label: '대리', value: 'ASSISTANT_MGR' },
    { label: '과장', value: 'MANAGER' },
    { label: '차장', value: 'DEPUTY_GM' },
    { label: '부장', value: 'GENERAL_MGR' },
    { label: '이사', value: 'DIRECTOR' },
  ];

  const employmentStatusOptions = [
    { label: '재직', value: 'ACTIVE' },
    { label: '퇴사', value: 'RESIGNED' },
    { label: '휴직', value: 'LEAVE' },
  ];

  const columns: ColumnsType<MemberResponse> = [
    { title: '아이디', dataIndex: 'loginId', key: 'loginId', width: 120 },
    { title: '이름', dataIndex: 'memberName', key: 'memberName', width: 100 },
    { title: '직급', dataIndex: 'position', key: 'position', width: 80,
      render: (v: string) => positionOptions.find((o) => o.value === v)?.label ?? v },
    { title: '담당업무', dataIndex: 'jobTitle', key: 'jobTitle', width: 120 },
    {
      title: '재직상태',
      dataIndex: 'employmentStatus',
      key: 'employmentStatus',
      width: 90,
      align: 'center',
      render: (v: string) => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v] || v}</Tag>,
    },
    { title: '입사일', dataIndex: 'hireDate', key: 'hireDate', width: 110 },
    { title: '근무지', dataIndex: 'workLocation', key: 'workLocation', width: 100 },
    {
      title: '관리',
      key: 'actions',
      width: 260,
      render: (_, record) => (
        <Space size="small">
          {hasPermission('/members', 'UPDATE') && (
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record.memberId)} />
          )}
          {hasPermission('/members', 'UPDATE') && (
            <Button size="small" icon={<SafetyOutlined />} onClick={() => openRoleModal(record.memberId)}>
              권한
            </Button>
          )}
          {hasPermission('/members', 'DELETE') && record.employmentStatus !== 'RESIGNED' && (
            <Button
              size="small"
              icon={<LogoutOutlined />}
              onClick={() => handleResign(record.memberId)}
            >
              퇴사
            </Button>
          )}
          {hasPermission('/members', 'DELETE') && (
            <Popconfirm title="삭제하시겠습니까?" onConfirm={() => deleteMutation.mutate(record.memberId)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const searchFormNode = (
    <Form form={searchForm} layout="inline" onFinish={handleSearch}>
      <Form.Item name="keyword">
        <Input placeholder="이름/아이디 검색" allowClear />
      </Form.Item>
      <Form.Item name="deptId">
        <Select allowClear placeholder="부서" options={deptOptions} style={{ width: 160 }} />
      </Form.Item>
      <Form.Item name="employmentStatus">
        <Select allowClear placeholder="재직상태" options={employmentStatusOptions} style={{ width: 120 }} />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">검색</Button>
          <Button onClick={handleReset}>초기화</Button>
        </Space>
      </Form.Item>
    </Form>
  );

  return (
    <>
      <SearchTable<MemberResponse>
        cardTitle="사용자 관리"
        extra={
          hasPermission('/members', 'CREATE') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              등록
            </Button>
          )
        }
        searchForm={searchFormNode}
        columns={columns}
        dataSource={data?.content}
        rowKey="memberId"
        loading={isLoading}
        total={data?.totalElements}
        current={current}
        pageSize={size}
        onPageChange={onPageChange}
      />

      <FormModal
        title={editingId ? '사용자 수정' : '사용자 등록'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saveMutation.isPending}
        form={form}
      >
        <Form.Item
          name="loginId"
          label="로그인 ID"
          rules={[
            { required: true, message: '로그인 ID를 입력하세요.' },
            { pattern: /^[a-z0-9.]+$/, message: '소문자, 숫자, 마침표만 사용 가능합니다.' },
          ]}
        >
          <Input disabled={!!editingId} />
        </Form.Item>
        {!editingId && (
          <Form.Item
            name="password"
            label="비밀번호"
            rules={[
              { required: true, message: '비밀번호를 입력하세요.' },
              { min: 8, message: '8자 이상 입력하세요.' },
            ]}
          >
            <Input.Password />
          </Form.Item>
        )}
        <Form.Item name="memberName" label="이름" rules={[{ required: true, message: '이름을 입력하세요.' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="deptId" label="부서" rules={[{ required: true, message: '부서를 선택하세요.' }]}>
          <Select placeholder="부서 선택" options={deptOptions} />
        </Form.Item>
        <Form.Item name="position" label="직급" rules={[{ required: true, message: '직급을 선택하세요.' }]}>
          <Select placeholder="직급 선택" options={positionOptions} />
        </Form.Item>
        <Form.Item name="jobTitle" label="담당업무">
          <Input />
        </Form.Item>
        <Form.Item name="hireDate" label="입사일" rules={[{ required: true, message: '입사일을 입력하세요.' }]}>
          <Input type="date" />
        </Form.Item>
        <Form.Item name="workLocation" label="근무지" rules={[{ required: true, message: '근무지를 입력하세요.' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="이메일">
          <Input type="email" />
        </Form.Item>
        <Form.Item name="phone" label="연락처">
          <Input />
        </Form.Item>
      </FormModal>

      <Modal
        title="권한 설정"
        open={roleModalOpen}
        onCancel={() => setRoleModalOpen(false)}
        onOk={handleRoleSave}
        confirmLoading={roleMutation.isPending}
        okText="저장"
        cancelText="취소"
      >
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="권한을 선택하세요"
          value={selectedRoleIds}
          onChange={setSelectedRoleIds}
          options={roles.map((r) => ({ label: r.roleName, value: r.roleId }))}
        />
      </Modal>
    </>
  );
};

export default MemberManagePage;
