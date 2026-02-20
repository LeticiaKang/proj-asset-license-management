import React, { useState } from 'react';
import { Button, Card, Form, Input, InputNumber, List, Space, Tag, Popconfirm, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import SearchTable from '@/components/table/SearchTable';
import FormModal from '@/components/form/FormModal';
import { codeApi } from '@/api/code.api';
import { usePermission } from '@/hooks/usePermission';
import type { CommonCodeResponse, CommonCodeRequest, CodeGroupResponse } from '@/types/commoncode.types';

const CommonCodeManagePage: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const [form] = Form.useForm<CommonCodeRequest>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const { data: groups = [] } = useQuery({
    queryKey: ['codeGroups'],
    queryFn: codeApi.getGroups,
  });

  const { data: codes = [], isLoading: codesLoading } = useQuery({
    queryKey: ['codes', selectedGroup],
    queryFn: () => codeApi.getByGroup(selectedGroup!),
    enabled: !!selectedGroup,
  });

  const saveMutation = useMutation({
    mutationFn: (values: CommonCodeRequest) =>
      editingId ? codeApi.update(editingId, values) : codeApi.create(values),
    onSuccess: () => {
      message.success(editingId ? '수정되었습니다.' : '등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['codes', selectedGroup] });
      queryClient.invalidateQueries({ queryKey: ['codeGroups'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: codeApi.delete,
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['codes', selectedGroup] });
    },
  });

  const openCreateModal = () => {
    if (!selectedGroup) {
      message.warning('코드 그룹을 먼저 선택하세요.');
      return;
    }
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ groupCode: selectedGroup });
    setModalOpen(true);
  };

  const openEditModal = (record: CommonCodeResponse) => {
    setEditingId(record.codeId);
    form.setFieldsValue({
      groupCode: record.groupCode,
      code: record.code,
      codeName: record.codeName,
      codeOrder: record.codeOrder,
      description: record.description ?? undefined,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    saveMutation.mutate(values);
  };

  const columns: ColumnsType<CommonCodeResponse> = [
    { title: '코드', dataIndex: 'code', key: 'code', width: 150 },
    { title: '코드명', dataIndex: 'codeName', key: 'codeName' },
    { title: '순서', dataIndex: 'codeOrder', key: 'codeOrder', width: 80, align: 'center' },
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
      width: 130,
      render: (_, record) => (
        <Space size="small">
          {hasPermission('/common-codes', 'UPDATE') && (
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          )}
          {hasPermission('/common-codes', 'DELETE') && (
            <Popconfirm title="삭제하시겠습니까?" onConfirm={() => deleteMutation.mutate(record.codeId)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card title="코드 그룹" size="small">
          <List
            size="small"
            dataSource={groups}
            renderItem={(item: CodeGroupResponse) => (
              <List.Item
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedGroup === item.groupCode ? '#e6f4ff' : undefined,
                  padding: '8px 12px',
                }}
                onClick={() => setSelectedGroup(item.groupCode)}
              >
                {item.groupCode}
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col span={18}>
        <SearchTable<CommonCodeResponse>
          cardTitle={selectedGroup ? `코드 목록 — ${selectedGroup}` : '코드 목록'}
          extra={
            hasPermission('/common-codes', 'CREATE') && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                등록
              </Button>
            )
          }
          columns={columns}
          dataSource={codes}
          rowKey="codeId"
          loading={codesLoading}
          pagination={false}
        />
      </Col>

      <FormModal
        title={editingId ? '코드 수정' : '코드 등록'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saveMutation.isPending}
        form={form}
      >
        <Form.Item name="groupCode" label="그룹코드" rules={[{ required: true }]}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="code" label="코드" rules={[{ required: true, message: '코드를 입력하세요.' }]}>
          <Input disabled={!!editingId} />
        </Form.Item>
        <Form.Item name="codeName" label="코드명" rules={[{ required: true, message: '코드명을 입력하세요.' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="codeOrder" label="정렬순서" initialValue={0}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="description" label="설명">
          <Input.TextArea rows={2} />
        </Form.Item>
      </FormModal>
    </Row>
  );
};

export default CommonCodeManagePage;
