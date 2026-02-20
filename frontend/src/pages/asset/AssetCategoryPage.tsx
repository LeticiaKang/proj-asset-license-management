import React, { useState } from 'react';
import { Button, Form, Input, InputNumber, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import SearchTable from '@/components/table/SearchTable';
import FormModal from '@/components/form/FormModal';
import { assetApi } from '@/api/asset.api';
import { usePermission } from '@/hooks/usePermission';
import type { AssetCategoryResponse, AssetCategoryRequest } from '@/types/asset.types';

const AssetCategoryPage: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const [form] = Form.useForm<AssetCategoryRequest>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['assetCategories'],
    queryFn: assetApi.getCategories,
  });

  const saveMutation = useMutation({
    mutationFn: (values: AssetCategoryRequest) =>
      editingId ? assetApi.updateCategory(editingId, values) : assetApi.createCategory(values),
    onSuccess: () => {
      message.success(editingId ? '수정되었습니다.' : '등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['assetCategories'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: assetApi.deleteCategory,
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['assetCategories'] });
    },
  });

  const openCreateModal = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record: AssetCategoryResponse) => {
    setEditingId(record.categoryId);
    form.setFieldsValue({
      categoryName: record.categoryName,
      categoryCode: record.categoryCode,
      categoryOrder: record.categoryOrder,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    saveMutation.mutate(values);
  };

  const columns: ColumnsType<AssetCategoryResponse> = [
    { title: '카테고리명', dataIndex: 'categoryName', key: 'categoryName' },
    { title: '카테고리코드', dataIndex: 'categoryCode', key: 'categoryCode', width: 150 },
    { title: '정렬순서', dataIndex: 'categoryOrder', key: 'categoryOrder', width: 100, align: 'center' },
    {
      title: '관리',
      key: 'actions',
      width: 130,
      render: (_, record) => (
        <Space size="small">
          {hasPermission('/assets/categories', 'UPDATE') && (
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          )}
          {hasPermission('/assets/categories', 'DELETE') && (
            <Popconfirm title="삭제하시겠습니까?" onConfirm={() => deleteMutation.mutate(record.categoryId)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <SearchTable<AssetCategoryResponse>
        cardTitle="자산 유형 관리"
        extra={
          hasPermission('/assets/categories', 'CREATE') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              등록
            </Button>
          )
        }
        columns={columns}
        dataSource={categories}
        rowKey="categoryId"
        loading={isLoading}
        pagination={false}
      />

      <FormModal
        title={editingId ? '카테고리 수정' : '카테고리 등록'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saveMutation.isPending}
        form={form}
      >
        <Form.Item name="categoryName" label="카테고리명" rules={[{ required: true, message: '카테고리명을 입력하세요.' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="categoryCode" label="카테고리코드" rules={[{ required: true, message: '카테고리코드를 입력하세요.' }]}>
          <Input disabled={!!editingId} />
        </Form.Item>
        <Form.Item name="categoryOrder" label="정렬순서" initialValue={0}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </FormModal>
    </>
  );
};

export default AssetCategoryPage;
