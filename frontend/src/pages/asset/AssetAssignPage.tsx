import React, { useState } from 'react';
import { Button, Descriptions, Form, Input, Modal, Select, Space, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import SearchTable from '@/components/table/SearchTable';
import FormModal from '@/components/form/FormModal';
import { assetApi, assetAssignmentApi } from '@/api/asset.api';
import { memberApi } from '@/api/member.api';
import { usePagination } from '@/hooks/usePagination';
import { usePermission } from '@/hooks/usePermission';
import { STATUS_COLOR, STATUS_LABEL } from '@/utils/constants';
import type { AssetAssignmentResponse, AssetAssignmentRequest, AssetReturnRequest, AssetTransferRequest } from '@/types/asset.types';
import type { MemberAssignmentDetail } from '@/types/member.types';

const AssetAssignPage: React.FC = () => {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const { page, size, current, onPageChange } = usePagination();
  const [assignForm] = Form.useForm<AssetAssignmentRequest>();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [memberDetail, setMemberDetail] = useState<MemberAssignmentDetail | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['assetAssignments', page, size],
    queryFn: () => assetAssignmentApi.search({ page, size }),
  });

  // 사용가능한 자산 목록 (배정 모달용)
  const { data: availableAssets = [] } = useQuery({
    queryKey: ['assets', 'available'],
    queryFn: () => assetApi.search({ assetStatus: 'AVAILABLE', page: 0, size: 1000 }),
    select: (d) => d.content,
    enabled: assignModalOpen,
  });

  // 재직 중인 사용자 (배정 모달용)
  const { data: activeMembers } = useQuery({
    queryKey: ['members', 'active'],
    queryFn: () => memberApi.search({ employmentStatus: 'ACTIVE', page: 0, size: 1000 }),
    select: (d) => d.content,
    enabled: assignModalOpen,
  });

  const assignMutation = useMutation({
    mutationFn: assetAssignmentApi.assign,
    onSuccess: () => {
      message.success('배정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['assetAssignments'] });
      setAssignModalOpen(false);
    },
  });

  const returnMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssetReturnRequest }) =>
      assetAssignmentApi.return(id, data),
    onSuccess: () => {
      message.success('반납되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['assetAssignments'] });
    },
  });

  const transferMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssetTransferRequest }) =>
      assetAssignmentApi.transfer(id, data),
    onSuccess: () => {
      message.success('이관되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['assetAssignments'] });
    },
  });

  const openMemberDetail = async (memberId: number) => {
    const detail = await assetAssignmentApi.getMemberDetail(memberId);
    setMemberDetail(detail);
    setDetailModalOpen(true);
  };

  const handleAssign = async () => {
    const values = await assignForm.validateFields();
    assignMutation.mutate(values);
  };

  const handleReturn = (assignmentId: number) => {
    modal.confirm({
      title: '반납 처리',
      content: '해당 자산을 반납 처리하시겠습니까?',
      okText: '반납',
      cancelText: '취소',
      onOk: () =>
        returnMutation.mutateAsync({
          id: assignmentId,
          data: { returnDate: new Date().toISOString().split('T')[0] },
        }),
    });
  };

  const handleTransfer = (assignmentId: number) => {
    let newMemberId: number | undefined;
    modal.confirm({
      title: '이관 처리',
      content: (
        <Select
          style={{ width: '100%', marginTop: 8 }}
          placeholder="이관 대상자 선택"
          options={activeMembers?.map((m) => ({ label: m.memberName, value: m.memberId }))}
          onChange={(v) => { newMemberId = v; }}
        />
      ),
      okText: '이관',
      cancelText: '취소',
      onOk: () => {
        if (!newMemberId) {
          message.warning('이관 대상자를 선택하세요.');
          return Promise.reject();
        }
        return transferMutation.mutateAsync({
          id: assignmentId,
          data: { newMemberId },
        });
      },
    });
  };

  const columns: ColumnsType<AssetAssignmentResponse> = [
    { title: '자산명', dataIndex: 'assetName', key: 'assetName' },
    { title: '유형', dataIndex: 'categoryName', key: 'categoryName', width: 100 },
    { title: '사용자', dataIndex: 'memberName', key: 'memberName', width: 100,
      render: (v: string, record) => (
        <a onClick={() => openMemberDetail(record.memberId)}>{v}</a>
      ),
    },
    { title: '배정일', dataIndex: 'assignedDate', key: 'assignedDate', width: 110 },
    { title: '반납일', dataIndex: 'returnDate', key: 'returnDate', width: 110,
      render: (v: string | null) => v ?? '-' },
    {
      title: '상태',
      dataIndex: 'assignmentStatus',
      key: 'assignmentStatus',
      width: 90,
      align: 'center',
      render: (v: string) => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v] || v}</Tag>,
    },
    { title: '비고', dataIndex: 'remarks', key: 'remarks', ellipsis: true },
    {
      title: '관리',
      key: 'actions',
      width: 150,
      render: (_, record) => {
        if (record.assignmentStatus !== 'ASSIGNED') return null;
        return (
          <Space size="small">
            {hasPermission('/asset-assignments', 'UPDATE') && (
              <Button size="small" onClick={() => handleReturn(record.assignmentId)}>반납</Button>
            )}
            {hasPermission('/asset-assignments', 'UPDATE') && (
              <Button size="small" onClick={() => handleTransfer(record.assignmentId)}>이관</Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <SearchTable<AssetAssignmentResponse>
        cardTitle="자산 배정"
        extra={
          hasPermission('/asset-assignments', 'CREATE') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { assignForm.resetFields(); setAssignModalOpen(true); }}>
              배정
            </Button>
          )
        }
        columns={columns}
        dataSource={data?.content}
        rowKey="assignmentId"
        loading={isLoading}
        total={data?.totalElements}
        current={current}
        pageSize={size}
        onPageChange={onPageChange}
      />

      <FormModal
        title="자산 배정"
        open={assignModalOpen}
        onCancel={() => setAssignModalOpen(false)}
        onOk={handleAssign}
        confirmLoading={assignMutation.isPending}
        form={assignForm}
      >
        <Form.Item name="assetId" label="자산" rules={[{ required: true, message: '자산을 선택하세요.' }]}>
          <Select
            showSearch
            placeholder="사용가능한 자산 선택"
            optionFilterProp="label"
            options={availableAssets?.map((a) => ({ label: `${a.assetName} (${a.serialNumber || '-'})`, value: a.assetId }))}
          />
        </Form.Item>
        <Form.Item name="memberId" label="사용자" rules={[{ required: true, message: '사용자를 선택하세요.' }]}>
          <Select
            showSearch
            placeholder="사용자 선택"
            optionFilterProp="label"
            options={activeMembers?.map((m) => ({ label: `${m.memberName} (${m.loginId})`, value: m.memberId }))}
          />
        </Form.Item>
        <Form.Item name="assignedDate" label="배정일" rules={[{ required: true, message: '배정일을 입력하세요.' }]}>
          <Input type="date" />
        </Form.Item>
        <Form.Item name="remarks" label="비고">
          <Input.TextArea rows={2} />
        </Form.Item>
      </FormModal>

      <Modal
        title="사용자 배정 현황"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {memberDetail && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="이름">{memberDetail.userInfo.memberName}</Descriptions.Item>
              <Descriptions.Item label="아이디">{memberDetail.userInfo.loginId}</Descriptions.Item>
              <Descriptions.Item label="입사일">{memberDetail.userInfo.hireDate}</Descriptions.Item>
              <Descriptions.Item label="퇴사일">{memberDetail.userInfo.resignDate ?? '-'}</Descriptions.Item>
            </Descriptions>
            <Table
              title={() => '자산 배정'}
              columns={[
                { title: '유형', dataIndex: 'categoryName', key: 'categoryName', width: 100 },
                { title: '자산명', dataIndex: 'assetName', key: 'assetName' },
                { title: '모델명', dataIndex: 'modelName', key: 'modelName', width: 120 },
                { title: '배정일', dataIndex: 'assignedDate', key: 'assignedDate', width: 110 },
              ]}
              dataSource={memberDetail.assetAssignments}
              rowKey="assignmentId"
              pagination={false}
              size="small"
            />
            <Table
              title={() => '라이센스 배정'}
              columns={[
                { title: '소프트웨어', dataIndex: 'softwareName', key: 'softwareName' },
                { title: '버전', dataIndex: 'licenseVersion', key: 'licenseVersion', width: 80 },
                { title: '유형', dataIndex: 'licenseType', key: 'licenseType', width: 80 },
                { title: '배정일', dataIndex: 'assignedDate', key: 'assignedDate', width: 110 },
              ]}
              dataSource={memberDetail.licenseAssignments}
              rowKey="assignmentId"
              pagination={false}
              size="small"
            />
          </Space>
        )}
      </Modal>
    </>
  );
};

export default AssetAssignPage;
