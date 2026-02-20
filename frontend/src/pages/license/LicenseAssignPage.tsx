import React, { useState } from 'react';
import { Button, Descriptions, Form, Input, Modal, Select, Space, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import SearchTable from '@/components/table/SearchTable';
import FormModal from '@/components/form/FormModal';
import { licenseApi, licenseAssignmentApi } from '@/api/license.api';
import { memberApi } from '@/api/member.api';
import { usePagination } from '@/hooks/usePagination';
import { usePermission } from '@/hooks/usePermission';
import { STATUS_COLOR, STATUS_LABEL, LICENSE_TYPE_LABEL } from '@/utils/constants';
import type {
  LicenseAssignmentResponse,
  LicenseAssignmentRequest,
  LicenseResponse,
  LicenseKeyResponse,
} from '@/types/license.types';
import type { MemberAssignmentDetail } from '@/types/member.types';

const LicenseAssignPage: React.FC = () => {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const { page, size, current, onPageChange } = usePagination();
  const [assignForm] = Form.useForm<LicenseAssignmentRequest>();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<LicenseResponse | null>(null);
  const [availableKeys, setAvailableKeys] = useState<LicenseKeyResponse[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [memberDetail, setMemberDetail] = useState<MemberAssignmentDetail | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['licenseAssignments', page, size],
    queryFn: () => licenseAssignmentApi.search({ page, size }),
  });

  // 활성 라이센스 목록 (잔여수량 > 0)
  const { data: licenses = [] } = useQuery({
    queryKey: ['licenses', 'active'],
    queryFn: () => licenseApi.search({ page: 0, size: 1000 }),
    select: (d) => d.content.filter((l) => l.isActive && l.remainQty > 0),
    enabled: assignModalOpen,
  });

  const { data: activeMembers } = useQuery({
    queryKey: ['members', 'active'],
    queryFn: () => memberApi.search({ employmentStatus: 'ACTIVE', page: 0, size: 1000 }),
    select: (d) => d.content,
    enabled: assignModalOpen,
  });

  const assignMutation = useMutation({
    mutationFn: licenseAssignmentApi.assign,
    onSuccess: () => {
      message.success('배정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['licenseAssignments'] });
      setAssignModalOpen(false);
    },
  });

  const returnMutation = useMutation({
    mutationFn: (assignmentId: number) =>
      licenseAssignmentApi.return(assignmentId, {}),
    onSuccess: () => {
      message.success('회수되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['licenseAssignments'] });
    },
  });

  const handleLicenseChange = async (licenseId: number) => {
    const license = licenses.find((l) => l.licenseId === licenseId);
    setSelectedLicense(license ?? null);

    if (license?.licenseType === 'INDIVIDUAL') {
      const keys = await licenseApi.getKeys(licenseId);
      setAvailableKeys(keys.filter((k) => k.keyStatus === 'AVAILABLE'));
    } else {
      setAvailableKeys([]);
    }
    assignForm.setFieldValue('keyId', undefined);
  };

  const openMemberDetail = async (memberId: number) => {
    const detail = await licenseAssignmentApi.getMemberDetail(memberId);
    setMemberDetail(detail);
    setDetailModalOpen(true);
  };

  const handleAssign = async () => {
    const values = await assignForm.validateFields();
    assignMutation.mutate(values);
  };

  const handleReturn = (assignmentId: number) => {
    modal.confirm({
      title: '회수 처리',
      content: '해당 라이센스를 회수하시겠습니까?',
      okText: '회수',
      cancelText: '취소',
      onOk: () => returnMutation.mutateAsync(assignmentId),
    });
  };

  const columns: ColumnsType<LicenseAssignmentResponse> = [
    { title: '소프트웨어', dataIndex: 'softwareName', key: 'softwareName' },
    {
      title: '유형',
      dataIndex: 'licenseType',
      key: 'licenseType',
      width: 80,
      render: (v: string) => LICENSE_TYPE_LABEL[v] || v,
    },
    { title: '버전', dataIndex: 'licenseVersion', key: 'licenseVersion', width: 80 },
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
    { title: '사유', dataIndex: 'assignmentReason', key: 'assignmentReason', ellipsis: true },
    {
      title: '관리',
      key: 'actions',
      width: 80,
      render: (_, record) => {
        if (record.assignmentStatus !== 'ASSIGNED') return null;
        return (
          hasPermission('/license-assignments', 'UPDATE') && (
            <Button size="small" onClick={() => handleReturn(record.assignmentId)}>회수</Button>
          )
        );
      },
    },
  ];

  return (
    <>
      <SearchTable<LicenseAssignmentResponse>
        cardTitle="라이센스 배정"
        extra={
          hasPermission('/license-assignments', 'CREATE') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                assignForm.resetFields();
                setSelectedLicense(null);
                setAvailableKeys([]);
                setAssignModalOpen(true);
              }}
            >
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
        title="라이센스 배정"
        open={assignModalOpen}
        onCancel={() => setAssignModalOpen(false)}
        onOk={handleAssign}
        confirmLoading={assignMutation.isPending}
        form={assignForm}
      >
        <Form.Item name="licenseId" label="라이센스" rules={[{ required: true, message: '라이센스를 선택하세요.' }]}>
          <Select
            showSearch
            placeholder="라이센스 선택"
            optionFilterProp="label"
            options={licenses.map((l) => ({
              label: `${l.softwareName} (${LICENSE_TYPE_LABEL[l.licenseType]}) - 잔여: ${l.remainQty}`,
              value: l.licenseId,
            }))}
            onChange={handleLicenseChange}
          />
        </Form.Item>

        {selectedLicense?.licenseType === 'INDIVIDUAL' && (
          <Form.Item name="keyId" label="라이센스 키" rules={[{ required: true, message: '개별형은 키를 선택해야 합니다.' }]}>
            <Select
              placeholder="키 선택"
              options={availableKeys.map((k) => ({
                label: k.licenseKey,
                value: k.keyId,
              }))}
            />
          </Form.Item>
        )}

        <Form.Item name="memberId" label="사용자" rules={[{ required: true, message: '사용자를 선택하세요.' }]}>
          <Select
            showSearch
            placeholder="사용자 선택"
            optionFilterProp="label"
            options={activeMembers?.map((m) => ({
              label: `${m.memberName} (${m.loginId})`,
              value: m.memberId,
            }))}
          />
        </Form.Item>
        <Form.Item name="assignedDate" label="배정일" rules={[{ required: true, message: '배정일을 입력하세요.' }]}>
          <Input type="date" />
        </Form.Item>
        <Form.Item name="assignmentReason" label="배정 사유" rules={[{ required: true, message: '배정 사유를 입력하세요.' }]}>
          <Input.TextArea rows={2} />
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

export default LicenseAssignPage;
