import React, { useState, useMemo } from 'react';
import { Button, Form, Input, InputNumber, Select, Space, Tag, Popconfirm, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import SearchTable from '@/components/table/SearchTable';
import FormModal from '@/components/form/FormModal';
import { deptApi } from '@/api/dept.api';
import { usePermission } from '@/hooks/usePermission';
import type { DeptResponse, DeptRequest } from '@/types/dept.types';

const DeptManagePage: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const [form] = Form.useForm<DeptRequest>();
  const [moveForm] = Form.useForm<{ newParentDeptId: number | null }>();
  const [modalOpen, setModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [movingId, setMovingId] = useState<number | null>(null);

  const { data: depts = [], isLoading } = useQuery({
    queryKey: ['depts'],
    queryFn: deptApi.getTree,
  });

  const saveMutation = useMutation({
    mutationFn: (values: DeptRequest) =>
      editingId ? deptApi.update(editingId, values) : deptApi.create(values),
    onSuccess: () => {
      message.success(editingId ? '수정되었습니다.' : '등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['depts'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deptApi.delete,
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['depts'] });
    },
  });

  const moveMutation = useMutation({
    mutationFn: (values: { newParentDeptId: number | null }) =>
      deptApi.move(movingId!, values),
    onSuccess: () => {
      message.success('이동되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['depts'] });
      setMoveModalOpen(false);
    },
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

  const parentOptions = useMemo(() => flattenDepts(depts), [depts]);

  const openCreateModal = (parentDeptId?: number) => {
    setEditingId(null);
    form.resetFields();
    if (parentDeptId) {
      form.setFieldsValue({ parentDeptId });
    }
    setModalOpen(true);
  };

  const openEditModal = (record: DeptResponse) => {
    setEditingId(record.deptId);
    form.setFieldsValue({
      parentDeptId: record.parentDeptId,
      deptName: record.deptName,
      deptCode: record.deptCode,
      deptOrder: record.deptOrder,
    });
    setModalOpen(true);
  };

  const openMoveModal = (record: DeptResponse) => {
    setMovingId(record.deptId);
    moveForm.resetFields();
    moveForm.setFieldsValue({ newParentDeptId: record.parentDeptId });
    setMoveModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    saveMutation.mutate(values);
  };

  const handleMove = async () => {
    const values = await moveForm.validateFields();
    moveMutation.mutate(values);
  };

  const columns: ColumnsType<DeptResponse> = [
    { title: '부서명', dataIndex: 'deptName', key: 'deptName' },
    { title: '부서코드', dataIndex: 'deptCode', key: 'deptCode', width: 150 },
    { title: '순서', dataIndex: 'deptOrder', key: 'deptOrder', width: 80, align: 'center' },
    { title: '깊이', dataIndex: 'deptDepth', key: 'deptDepth', width: 80, align: 'center' },
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
      width: 250,
      render: (_, record) => (
        <Space size="small">
          {hasPermission('/departments', 'CREATE') && record.deptDepth < 4 && (
            <Button size="small" onClick={() => openCreateModal(record.deptId)}>
              하위 추가
            </Button>
          )}
          {hasPermission('/departments', 'UPDATE') && (
            <Button size="small" icon={<DragOutlined />} onClick={() => openMoveModal(record)}>
              이동
            </Button>
          )}
          {hasPermission('/departments', 'UPDATE') && (
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          )}
          {hasPermission('/departments', 'DELETE') && (
            <Popconfirm title="삭제하시겠습니까?" onConfirm={() => deleteMutation.mutate(record.deptId)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <SearchTable<DeptResponse>
        cardTitle="부서 관리"
        extra={
          hasPermission('/departments', 'CREATE') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal()}>
              등록
            </Button>
          )
        }
        columns={columns}
        dataSource={depts}
        rowKey="deptId"
        loading={isLoading}
        pagination={false}
        expandable={{ childrenColumnName: 'children' }}
      />

      <FormModal
        title={editingId ? '부서 수정' : '부서 등록'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saveMutation.isPending}
        form={form}
      >
        <Form.Item name="parentDeptId" label="상위 부서">
          <Select allowClear placeholder="최상위 부서" options={parentOptions} />
        </Form.Item>
        <Form.Item name="deptName" label="부서명" rules={[{ required: true, message: '부서명을 입력하세요.' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="deptCode" label="부서코드" rules={[{ required: true, message: '부서코드를 입력하세요.' }]}>
          <Input disabled={!!editingId} />
        </Form.Item>
        <Form.Item name="deptOrder" label="정렬순서" initialValue={0}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </FormModal>

      <Modal
        title="부서 이동"
        open={moveModalOpen}
        onCancel={() => setMoveModalOpen(false)}
        onOk={handleMove}
        confirmLoading={moveMutation.isPending}
        okText="이동"
        cancelText="취소"
      >
        <Form form={moveForm} layout="vertical">
          <Form.Item name="newParentDeptId" label="이동할 상위 부서">
            <Select allowClear placeholder="최상위로 이동" options={parentOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DeptManagePage;
