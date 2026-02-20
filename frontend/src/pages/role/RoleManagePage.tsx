import React, { useState } from 'react';
import { Button, Form, Input, Space, Tag, Popconfirm, Modal, Table, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import SearchTable from '@/components/table/SearchTable';
import FormModal from '@/components/form/FormModal';
import { roleApi } from '@/api/role.api';
import { menuApi } from '@/api/menu.api';
import { usePermission } from '@/hooks/usePermission';
import type { RoleResponse, RoleRequest, RoleMenuPermission } from '@/types/role.types';
import type { MenuResponse } from '@/types/menu.types';

const RoleManagePage: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const [form] = Form.useForm<RoleRequest>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // 권한 설정 모달
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [permRoleId, setPermRoleId] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<RoleMenuPermission[]>([]);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: roleApi.getAll,
  });

  const { data: menuTree = [] } = useQuery({
    queryKey: ['menus'],
    queryFn: menuApi.getTree,
  });

  const saveMutation = useMutation({
    mutationFn: (values: RoleRequest) =>
      editingId ? roleApi.update(editingId, values) : roleApi.create(values),
    onSuccess: () => {
      message.success(editingId ? '수정되었습니다.' : '등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: roleApi.delete,
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const permSaveMutation = useMutation({
    mutationFn: () =>
      roleApi.updateMenuPermissions(permRoleId!, { menuPermissions: permissions }),
    onSuccess: () => {
      message.success('권한이 저장되었습니다.');
      setPermModalOpen(false);
    },
  });

  const openCreateModal = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record: RoleResponse) => {
    setEditingId(record.roleId);
    form.setFieldsValue({
      roleName: record.roleName,
      roleCode: record.roleCode,
      description: record.description ?? undefined,
    });
    setModalOpen(true);
  };

  const openPermModal = async (roleId: number) => {
    setPermRoleId(roleId);
    const perms = await roleApi.getMenuPermissions(roleId);
    // 메뉴 트리를 플랫하게 펼쳐서 권한 데이터와 매핑
    const flatMenus = flattenMenuTree(menuTree);
    const permMap = new Map(perms.map((p) => [p.menuId, p]));
    const merged = flatMenus.map((m) => ({
      menuId: m.menuId,
      menuName: m.menuName,
      canRead: permMap.get(m.menuId)?.canRead ?? false,
      canCreate: permMap.get(m.menuId)?.canCreate ?? false,
      canUpdate: permMap.get(m.menuId)?.canUpdate ?? false,
      canDelete: permMap.get(m.menuId)?.canDelete ?? false,
    }));
    setPermissions(merged);
    setPermModalOpen(true);
  };

  const flattenMenuTree = (items: MenuResponse[]): { menuId: number; menuName: string }[] => {
    const result: { menuId: number; menuName: string }[] = [];
    items.forEach((item) => {
      result.push({ menuId: item.menuId, menuName: item.menuName });
      if (item.children?.length) {
        result.push(...flattenMenuTree(item.children));
      }
    });
    return result;
  };

  const togglePerm = (menuId: number, field: keyof RoleMenuPermission) => {
    setPermissions((prev) =>
      prev.map((p) => (p.menuId === menuId ? { ...p, [field]: !p[field] } : p)),
    );
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    saveMutation.mutate(values);
  };

  const columns: ColumnsType<RoleResponse> = [
    { title: '역할명', dataIndex: 'roleName', key: 'roleName' },
    { title: '역할코드', dataIndex: 'roleCode', key: 'roleCode', width: 180 },
    { title: '설명', dataIndex: 'description', key: 'description' },
    {
      title: '상태',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      align: 'center',
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '활성' : '비활성'}</Tag>,
    },
    {
      title: '관리',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {hasPermission('/roles', 'UPDATE') && (
            <Button size="small" icon={<SettingOutlined />} onClick={() => openPermModal(record.roleId)}>
              권한
            </Button>
          )}
          {hasPermission('/roles', 'UPDATE') && (
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          )}
          {hasPermission('/roles', 'DELETE') && (
            <Popconfirm title="삭제하시겠습니까?" onConfirm={() => deleteMutation.mutate(record.roleId)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const permColumns: ColumnsType<RoleMenuPermission> = [
    { title: '메뉴명', dataIndex: 'menuName', key: 'menuName' },
    {
      title: '읽기',
      key: 'canRead',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Checkbox checked={record.canRead} onChange={() => togglePerm(record.menuId, 'canRead')} />
      ),
    },
    {
      title: '생성',
      key: 'canCreate',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Checkbox checked={record.canCreate} onChange={() => togglePerm(record.menuId, 'canCreate')} />
      ),
    },
    {
      title: '수정',
      key: 'canUpdate',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Checkbox checked={record.canUpdate} onChange={() => togglePerm(record.menuId, 'canUpdate')} />
      ),
    },
    {
      title: '삭제',
      key: 'canDelete',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Checkbox checked={record.canDelete} onChange={() => togglePerm(record.menuId, 'canDelete')} />
      ),
    },
  ];

  return (
    <>
      <SearchTable<RoleResponse>
        cardTitle="권한 관리"
        extra={
          hasPermission('/roles', 'CREATE') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              등록
            </Button>
          )
        }
        columns={columns}
        dataSource={roles}
        rowKey="roleId"
        loading={isLoading}
        pagination={false}
      />

      <FormModal
        title={editingId ? '역할 수정' : '역할 등록'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saveMutation.isPending}
        form={form}
      >
        <Form.Item name="roleName" label="역할명" rules={[{ required: true, message: '역할명을 입력하세요.' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="roleCode" label="역할코드" rules={[{ required: true, message: '역할코드를 입력하세요.' }]}>
          <Input disabled={!!editingId} placeholder="ROLE_XXX" />
        </Form.Item>
        <Form.Item name="description" label="설명">
          <Input.TextArea rows={2} />
        </Form.Item>
      </FormModal>

      <Modal
        title="메뉴 권한 설정"
        open={permModalOpen}
        onCancel={() => setPermModalOpen(false)}
        onOk={() => permSaveMutation.mutate()}
        confirmLoading={permSaveMutation.isPending}
        okText="저장"
        cancelText="취소"
        width={700}
      >
        <Table<RoleMenuPermission>
          columns={permColumns}
          dataSource={permissions}
          rowKey="menuId"
          pagination={false}
          size="small"
        />
      </Modal>
    </>
  );
};

export default RoleManagePage;
