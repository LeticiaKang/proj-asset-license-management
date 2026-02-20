import React, { useState } from 'react';
import { Button, Form, Input, InputNumber, Select, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import SearchTable from '@/components/table/SearchTable';
import FormModal from '@/components/form/FormModal';
import { licenseApi } from '@/api/license.api';
import { softwareApi } from '@/api/software.api';
import { usePagination } from '@/hooks/usePagination';
import { usePermission } from '@/hooks/usePermission';
import { LICENSE_TYPE_LABEL } from '@/utils/constants';
import type { LicenseResponse, LicenseRequest, LicenseSearchCondition } from '@/types/license.types';

const LicenseListPage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const { page, size, current, onPageChange, resetPage } = usePagination();
  const [form] = Form.useForm<LicenseRequest>();
  const [searchForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState<LicenseSearchCondition>({});
  const [selectedType, setSelectedType] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['licenses', page, size, search],
    queryFn: () => licenseApi.search({ ...search, page, size }),
  });

  const { data: softwares = [] } = useQuery({
    queryKey: ['softwares'],
    queryFn: softwareApi.getAll,
  });

  const softwareOptions = softwares.map((s) => ({ label: s.softwareName, value: s.softwareId }));
  const typeOptions = [
    { label: '볼륨', value: 'VOLUME' },
    { label: '개별', value: 'INDIVIDUAL' },
    { label: '구독', value: 'SUBSCRIPTION' },
  ];

  const saveMutation = useMutation({
    mutationFn: (values: LicenseRequest) =>
      editingId ? licenseApi.update(editingId, values) : licenseApi.create(values),
    onSuccess: () => {
      message.success(editingId ? '수정되었습니다.' : '등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: licenseApi.delete,
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
    },
  });

  const openCreateModal = () => {
    setEditingId(null);
    setSelectedType('');
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = async (id: number) => {
    const detail = await licenseApi.getById(id);
    setEditingId(id);
    setSelectedType(detail.licenseType);
    form.setFieldsValue({
      softwareId: detail.softwareId,
      licenseType: detail.licenseType,
      licenseVersion: detail.licenseVersion,
      totalQty: detail.totalQty,
      purchaseDate: detail.purchaseDate ?? undefined,
      expiryDate: detail.expiryDate ?? undefined,
      purchasePrice: detail.purchasePrice ?? undefined,
      installGuide: detail.installGuide,
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

  const columns: ColumnsType<LicenseResponse> = [
    {
      title: '소프트웨어',
      dataIndex: 'softwareName',
      key: 'softwareName',
      render: (text: string, record) => (
        <a onClick={() => navigate(`/licenses/${record.licenseId}`)}>{text}</a>
      ),
    },
    {
      title: '유형',
      dataIndex: 'licenseType',
      key: 'licenseType',
      width: 80,
      render: (v: string) => LICENSE_TYPE_LABEL[v] || v,
    },
    { title: '버전', dataIndex: 'licenseVersion', key: 'licenseVersion', width: 100 },
    { title: '총수량', dataIndex: 'totalQty', key: 'totalQty', width: 80, align: 'center' },
    { title: '사용', dataIndex: 'usedQty', key: 'usedQty', width: 80, align: 'center' },
    {
      title: '잔여',
      dataIndex: 'remainQty',
      key: 'remainQty',
      width: 80,
      align: 'center',
      render: (v: number) => <Tag color={v > 0 ? 'green' : 'red'}>{v}</Tag>,
    },
    { title: '만료일', dataIndex: 'expiryDate', key: 'expiryDate', width: 110,
      render: (v: string | null) => v ?? '-' },
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
      width: 100,
      render: (_, record) => (
        <Space size="small">
          {hasPermission('/licenses', 'UPDATE') && (
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record.licenseId)} />
          )}
          {hasPermission('/licenses', 'DELETE') && (
            <Popconfirm title="삭제하시겠습니까?" onConfirm={() => deleteMutation.mutate(record.licenseId)}>
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
        <Input placeholder="소프트웨어명 검색" allowClear />
      </Form.Item>
      <Form.Item name="licenseType">
        <Select allowClear placeholder="라이센스 유형" options={typeOptions} style={{ width: 130 }} />
      </Form.Item>
      <Form.Item name="softwareId">
        <Select allowClear placeholder="소프트웨어" options={softwareOptions} style={{ width: 160 }} />
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
      <SearchTable<LicenseResponse>
        cardTitle="라이센스 목록"
        extra={
          hasPermission('/licenses', 'CREATE') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              등록
            </Button>
          )
        }
        searchForm={searchFormNode}
        columns={columns}
        dataSource={data?.content}
        rowKey="licenseId"
        loading={isLoading}
        total={data?.totalElements}
        current={current}
        pageSize={size}
        onPageChange={onPageChange}
      />

      <FormModal
        title={editingId ? '라이센스 수정' : '라이센스 등록'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saveMutation.isPending}
        form={form}
        width={720}
      >
        <Form.Item name="softwareId" label="소프트웨어" rules={[{ required: true, message: '소프트웨어를 선택하세요.' }]}>
          <Select placeholder="소프트웨어 선택" options={softwareOptions} />
        </Form.Item>
        <Form.Item name="licenseType" label="라이센스 유형" rules={[{ required: true, message: '유형을 선택하세요.' }]}>
          <Select
            placeholder="유형 선택"
            options={typeOptions}
            onChange={(v) => setSelectedType(v)}
          />
        </Form.Item>
        <Form.Item name="licenseVersion" label="버전">
          <Input />
        </Form.Item>
        <Form.Item name="totalQty" label="총수량" rules={[{ required: true, message: '수량을 입력하세요.' }]}>
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="purchaseDate" label="구매일">
          <Input type="date" />
        </Form.Item>
        <Form.Item
          name="expiryDate"
          label="만료일"
          rules={selectedType === 'SUBSCRIPTION' ? [{ required: true, message: '구독형은 만료일이 필수입니다.' }] : []}
        >
          <Input type="date" />
        </Form.Item>
        <Form.Item name="purchasePrice" label="구매가격">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="installGuide" label="설치 가이드">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="remarks" label="비고">
          <Input.TextArea rows={2} />
        </Form.Item>
      </FormModal>
    </>
  );
};

export default LicenseListPage;
