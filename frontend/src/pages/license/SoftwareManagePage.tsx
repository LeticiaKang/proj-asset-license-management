import React, { useState } from 'react';
import { Button, Form, Input, Tag } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import SearchTable from '@/components/table/SearchTable';
import FormModal from '@/components/form/FormModal';
import { softwareApi } from '@/api/software.api';
import { usePermission } from '@/hooks/usePermission';
import type { SoftwareResponse, SoftwareRequest } from '@/types/software.types';

const SoftwareManagePage: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const [form] = Form.useForm<SoftwareRequest>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: softwares = [], isLoading } = useQuery({
    queryKey: ['softwares'],
    queryFn: softwareApi.getAll,
  });

  const saveMutation = useMutation({
    mutationFn: (values: SoftwareRequest) =>
      editingId ? softwareApi.update(editingId, values) : softwareApi.create(values),
    onSuccess: () => {
      message.success(editingId ? '수정되었습니다.' : '등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['softwares'] });
      setModalOpen(false);
    },
  });

  const openCreateModal = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record: SoftwareResponse) => {
    setEditingId(record.softwareId);
    form.setFieldsValue({
      softwareName: record.softwareName,
      publisher: record.publisher ?? undefined,
      description: record.description ?? undefined,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    saveMutation.mutate(values);
  };

  const columns: ColumnsType<SoftwareResponse> = [
    { title: '소프트웨어명', dataIndex: 'softwareName', key: 'softwareName' },
    { title: '배급사', dataIndex: 'publisher', key: 'publisher', width: 150 },
    { title: '설명', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '상태',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      align: 'center',
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '활성' : '비활성'}</Tag>,
    },
    { title: '등록일', dataIndex: 'regDate', key: 'regDate', width: 110 },
    {
      title: '관리',
      key: 'actions',
      width: 80,
      render: (_, record) =>
        hasPermission('/softwares', 'UPDATE') && (
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
        ),
    },
  ];

  return (
    <>
      <SearchTable<SoftwareResponse>
        cardTitle="소프트웨어 관리"
        extra={
          hasPermission('/softwares', 'CREATE') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              등록
            </Button>
          )
        }
        columns={columns}
        dataSource={softwares}
        rowKey="softwareId"
        loading={isLoading}
        pagination={false}
      />

      <FormModal
        title={editingId ? '소프트웨어 수정' : '소프트웨어 등록'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saveMutation.isPending}
        form={form}
      >
        <Form.Item name="softwareName" label="소프트웨어명" rules={[{ required: true, message: '소프트웨어명을 입력하세요.' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="publisher" label="배급사">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="설명">
          <Input.TextArea rows={3} />
        </Form.Item>
      </FormModal>
    </>
  );
};

export default SoftwareManagePage;
