import React, { useState } from 'react';
import { Button, Form, Input, InputNumber, Select, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import SearchTable from '@/components/table/SearchTable';
import FormModal from '@/components/form/FormModal';
import { assetApi } from '@/api/asset.api';
import { usePagination } from '@/hooks/usePagination';
import { usePermission } from '@/hooks/usePermission';
import { STATUS_COLOR, STATUS_LABEL } from '@/utils/constants';
import type { AssetResponse, AssetRequest, AssetSearchCondition, AssetCategoryResponse } from '@/types/asset.types';

const AssetListPage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const { page, size, current, onPageChange, resetPage } = usePagination();
  const [form] = Form.useForm<AssetRequest>();
  const [searchForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState<AssetSearchCondition>({});

  const { data, isLoading } = useQuery({
    queryKey: ['assets', page, size, search],
    queryFn: () => assetApi.search({ ...search, page, size }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['assetCategories'],
    queryFn: assetApi.getCategories,
  });

  const categoryOptions = categories.map((c: AssetCategoryResponse) => ({
    label: c.categoryName,
    value: c.categoryId,
  }));

  const statusOptions = [
    { label: '사용가능', value: 'AVAILABLE' },
    { label: '사용중', value: 'IN_USE' },
    { label: '수리중', value: 'REPAIR' },
    { label: '폐기', value: 'DISPOSED' },
    { label: '분실', value: 'LOST' },
  ];

  const saveMutation = useMutation({
    mutationFn: (values: AssetRequest) =>
      editingId ? assetApi.update(editingId, values) : assetApi.create(values),
    onSuccess: () => {
      message.success(editingId ? '수정되었습니다.' : '등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: assetApi.delete,
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });

  const openCreateModal = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = async (id: number) => {
    const detail = await assetApi.getById(id);
    setEditingId(id);
    form.setFieldsValue({
      categoryId: detail.categoryId,
      assetName: detail.assetName,
      manufacturer: detail.manufacturer,
      modelName: detail.modelName,
      serialNumber: detail.serialNumber,
      purchaseDate: detail.purchaseDate ?? undefined,
      purchasePrice: detail.purchasePrice ?? undefined,
      warrantyStartDate: detail.warrantyStartDate ?? undefined,
      warrantyEndDate: detail.warrantyEndDate ?? undefined,
      memory: detail.memory,
      storage: detail.storage,
      remarks: detail.remarks,
    });
    setModalOpen(true);
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

  const columns: ColumnsType<AssetResponse> = [
    { title: '자산명', dataIndex: 'assetName', key: 'assetName',
      render: (text: string, record) => (
        <a onClick={() => navigate(`/assets/${record.assetId}`)}>{text}</a>
      ),
    },
    { title: '유형', dataIndex: 'categoryName', key: 'categoryName', width: 100 },
    { title: '제조사', dataIndex: 'manufacturer', key: 'manufacturer', width: 120 },
    { title: '모델명', dataIndex: 'modelName', key: 'modelName', width: 120 },
    { title: '시리얼번호', dataIndex: 'serialNumber', key: 'serialNumber', width: 140 },
    {
      title: '상태',
      dataIndex: 'assetStatus',
      key: 'assetStatus',
      width: 90,
      align: 'center',
      render: (v: string) => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v] || v}</Tag>,
    },
    { title: '구매일', dataIndex: 'purchaseDate', key: 'purchaseDate', width: 110 },
    {
      title: '관리',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          {hasPermission('/assets', 'UPDATE') && (
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record.assetId)} />
          )}
          {hasPermission('/assets', 'DELETE') && (
            <Popconfirm title="삭제하시겠습니까?" onConfirm={() => deleteMutation.mutate(record.assetId)}>
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
        <Input placeholder="자산명/시리얼번호 검색" allowClear />
      </Form.Item>
      <Form.Item name="categoryId">
        <Select allowClear placeholder="자산 유형" options={categoryOptions} style={{ width: 140 }} />
      </Form.Item>
      <Form.Item name="assetStatus">
        <Select allowClear placeholder="상태" options={statusOptions} style={{ width: 120 }} />
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
      <SearchTable<AssetResponse>
        cardTitle="자산 목록"
        extra={
          hasPermission('/assets', 'CREATE') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              등록
            </Button>
          )
        }
        searchForm={searchFormNode}
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
        title={editingId ? '자산 수정' : '자산 등록'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saveMutation.isPending}
        form={form}
        width={720}
      >
        <Form.Item name="categoryId" label="자산 유형" rules={[{ required: true, message: '자산 유형을 선택하세요.' }]}>
          <Select placeholder="유형 선택" options={categoryOptions} />
        </Form.Item>
        <Form.Item name="assetName" label="자산명" rules={[{ required: true, message: '자산명을 입력하세요.' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="manufacturer" label="제조사">
          <Input />
        </Form.Item>
        <Form.Item name="modelName" label="모델명">
          <Input />
        </Form.Item>
        <Form.Item name="serialNumber" label="시리얼번호">
          <Input disabled={!!editingId} />
        </Form.Item>
        <Form.Item name="purchaseDate" label="구매일">
          <Input type="date" />
        </Form.Item>
        <Form.Item name="purchasePrice" label="구매가격">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="warrantyStartDate" label="보증 시작일">
          <Input type="date" />
        </Form.Item>
        <Form.Item name="warrantyEndDate" label="보증 종료일">
          <Input type="date" />
        </Form.Item>
        <Form.Item name="memory" label="메모리">
          <Input placeholder="예: 16GB" />
        </Form.Item>
        <Form.Item name="storage" label="저장장치">
          <Input placeholder="예: 512GB SSD" />
        </Form.Item>
        <Form.Item name="remarks" label="비고">
          <Input.TextArea rows={2} />
        </Form.Item>
      </FormModal>
    </>
  );
};

export default AssetListPage;
