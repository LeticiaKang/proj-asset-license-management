import React, { useState, useMemo } from 'react';
import { Button, Form, Input, InputNumber, Select, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import SearchTable from '@/components/table/SearchTable';
import FormModal from '@/components/form/FormModal';
import { menuApi } from '@/api/menu.api';
import { usePermission } from '@/hooks/usePermission';
import type { MenuResponse, MenuRequest } from '@/types/menu.types';

const MenuManagePage: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const [form] = Form.useForm<MenuRequest>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: menus = [], isLoading } = useQuery({
    queryKey: ['menus'],
    queryFn: menuApi.getTree,
  });

  const saveMutation = useMutation({
    mutationFn: (values: MenuRequest) =>
      editingId ? menuApi.update(editingId, values) : menuApi.create(values),
    onSuccess: () => {
      message.success(editingId ? '수정되었습니다.' : '등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: menuApi.delete,
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });

  const flattenMenus = (items: MenuResponse[], depth = 0): { label: string; value: number }[] => {
    const result: { label: string; value: number }[] = [];
    items.forEach((item) => {
      result.push({ label: `${'ㄴ'.repeat(depth)} ${item.menuName}`.trim(), value: item.menuId });
      if (item.children?.length) {
        result.push(...flattenMenus(item.children, depth + 1));
      }
    });
    return result;
  };

  const parentOptions = useMemo(() => flattenMenus(menus), [menus]);

  const openCreateModal = (parentMenuId?: number) => {
    setEditingId(null);
    form.resetFields();
    if (parentMenuId) {
      form.setFieldsValue({ parentMenuId });
    }
    setModalOpen(true);
  };

  const openEditModal = (record: MenuResponse) => {
    setEditingId(record.menuId);
    form.setFieldsValue({
      parentMenuId: record.parentMenuId,
      menuName: record.menuName,
      menuCode: record.menuCode,
      menuUrl: record.menuUrl ?? undefined,
      menuIcon: record.menuIcon ?? undefined,
      menuOrder: record.menuOrder,
      description: record.description ?? undefined,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    saveMutation.mutate(values);
  };

  const columns: ColumnsType<MenuResponse> = [
    { title: '메뉴명', dataIndex: 'menuName', key: 'menuName' },
    { title: '메뉴코드', dataIndex: 'menuCode', key: 'menuCode', width: 150 },
    { title: 'URL', dataIndex: 'menuUrl', key: 'menuUrl', width: 180 },
    { title: '아이콘', dataIndex: 'menuIcon', key: 'menuIcon', width: 120 },
    { title: '순서', dataIndex: 'menuOrder', key: 'menuOrder', width: 80, align: 'center' },
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
          {hasPermission('/menus', 'CREATE') && (
            <Button size="small" onClick={() => openCreateModal(record.menuId)}>
              하위 추가
            </Button>
          )}
          {hasPermission('/menus', 'UPDATE') && (
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
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

  return (
    <>
      <SearchTable<MenuResponse>
        cardTitle="메뉴 관리"
        extra={
          hasPermission('/menus', 'CREATE') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal()}>
              등록
            </Button>
          )
        }
        columns={columns}
        dataSource={menus}
        rowKey="menuId"
        loading={isLoading}
        pagination={false}
        expandable={{ childrenColumnName: 'children' }}
      />

      <FormModal
        title={editingId ? '메뉴 수정' : '메뉴 등록'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saveMutation.isPending}
        form={form}
      >
        <Form.Item name="parentMenuId" label="상위 메뉴">
          <Select allowClear placeholder="최상위 메뉴" options={parentOptions} />
        </Form.Item>
        <Form.Item name="menuName" label="메뉴명" rules={[{ required: true, message: '메뉴명을 입력하세요.' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="menuCode" label="메뉴코드" rules={[{ required: true, message: '메뉴코드를 입력하세요.' }]}>
          <Input disabled={!!editingId} />
        </Form.Item>
        <Form.Item name="menuUrl" label="URL">
          <Input placeholder="/example" />
        </Form.Item>
        <Form.Item name="menuIcon" label="아이콘">
          <Input placeholder="AppstoreOutlined" />
        </Form.Item>
        <Form.Item name="menuOrder" label="정렬순서" initialValue={0}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="description" label="설명">
          <Input.TextArea rows={2} />
        </Form.Item>
      </FormModal>
    </>
  );
};

export default MenuManagePage;
