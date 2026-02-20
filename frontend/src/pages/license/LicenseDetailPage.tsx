import React, { useState } from 'react';
import { Button, Card, Descriptions, Form, Input, Select, Space, Spin, Table, Tag } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import FormModal from '@/components/form/FormModal';
import { licenseApi } from '@/api/license.api';
import { usePermission } from '@/hooks/usePermission';
import { STATUS_COLOR, STATUS_LABEL, LICENSE_TYPE_LABEL } from '@/utils/constants';
import type { LicenseKeyResponse, LicenseKeyRequest } from '@/types/license.types';

const LicenseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();
  const [keyForm] = Form.useForm<LicenseKeyRequest>();
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [editingKeyId, setEditingKeyId] = useState<number | null>(null);

  const { data: license, isLoading } = useQuery({
    queryKey: ['licenses', id],
    queryFn: () => licenseApi.getById(Number(id)),
    enabled: !!id,
  });

  const keyMutation = useMutation({
    mutationFn: (values: LicenseKeyRequest) =>
      editingKeyId
        ? licenseApi.updateKey(editingKeyId, values)
        : licenseApi.createKey(Number(id), values),
    onSuccess: () => {
      message.success(editingKeyId ? '수정되었습니다.' : '등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['licenses', id] });
      setKeyModalOpen(false);
    },
  });

  const openKeyCreateModal = () => {
    setEditingKeyId(null);
    keyForm.resetFields();
    setKeyModalOpen(true);
  };

  const openKeyEditModal = (record: LicenseKeyResponse) => {
    setEditingKeyId(record.keyId);
    keyForm.setFieldsValue({
      licenseKey: record.licenseKey,
      keyStatus: record.keyStatus,
      remarks: record.remarks,
    });
    setKeyModalOpen(true);
  };

  const handleKeySave = async () => {
    const values = await keyForm.validateFields();
    keyMutation.mutate(values);
  };

  if (isLoading) {
    return <Spin style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;
  }

  if (!license) return null;

  const keyColumns: ColumnsType<LicenseKeyResponse> = [
    { title: '라이센스 키', dataIndex: 'licenseKey', key: 'licenseKey', ellipsis: true },
    {
      title: '상태',
      dataIndex: 'keyStatus',
      key: 'keyStatus',
      width: 100,
      align: 'center',
      render: (v: string) => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v] || v}</Tag>,
    },
    { title: '비고', dataIndex: 'remarks', key: 'remarks', ellipsis: true },
    {
      title: '관리',
      key: 'actions',
      width: 80,
      render: (_, record) =>
        hasPermission('/licenses', 'UPDATE') && (
          <Button size="small" icon={<EditOutlined />} onClick={() => openKeyEditModal(record)} />
        ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card
        title="라이센스 상세"
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            목록
          </Button>
        }
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="소프트웨어">{license.softwareName}</Descriptions.Item>
          <Descriptions.Item label="유형">{LICENSE_TYPE_LABEL[license.licenseType] || license.licenseType}</Descriptions.Item>
          <Descriptions.Item label="버전">{license.licenseVersion || '-'}</Descriptions.Item>
          <Descriptions.Item label="상태">
            <Tag color={license.isActive ? 'green' : 'default'}>{license.isActive ? '활성' : '비활성'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="총수량">{license.totalQty}</Descriptions.Item>
          <Descriptions.Item label="사용수량">{license.usedQty}</Descriptions.Item>
          <Descriptions.Item label="잔여수량">
            <Tag color={license.remainQty > 0 ? 'green' : 'red'}>{license.remainQty}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="구매일">{license.purchaseDate ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="만료일">{license.expiryDate ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="구매가격">
            {license.purchasePrice != null ? `${license.purchasePrice.toLocaleString()}원` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="설치 가이드" span={2}>{license.installGuide || '-'}</Descriptions.Item>
          <Descriptions.Item label="비고" span={2}>{license.remarks || '-'}</Descriptions.Item>
          <Descriptions.Item label="등록일">{license.regDate}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="라이센스 키 목록"
        extra={
          hasPermission('/licenses', 'CREATE') && (
            <Button type="primary" icon={<PlusOutlined />} size="small" onClick={openKeyCreateModal}>
              키 추가
            </Button>
          )
        }
      >
        <Table<LicenseKeyResponse>
          columns={keyColumns}
          dataSource={license.keys}
          rowKey="keyId"
          pagination={false}
          size="small"
        />
      </Card>

      <FormModal
        title={editingKeyId ? '라이센스 키 수정' : '라이센스 키 등록'}
        open={keyModalOpen}
        onCancel={() => setKeyModalOpen(false)}
        onOk={handleKeySave}
        confirmLoading={keyMutation.isPending}
        form={keyForm}
      >
        <Form.Item name="licenseKey" label="라이센스 키" rules={[{ required: true, message: '라이센스 키를 입력하세요.' }]}>
          <Input.TextArea rows={2} />
        </Form.Item>
        {editingKeyId && (
          <Form.Item name="keyStatus" label="상태">
            <Select
              options={[
                { label: '사용가능', value: 'AVAILABLE' },
                { label: '사용중', value: 'IN_USE' },
                { label: '만료', value: 'EXPIRED' },
                { label: '폐기', value: 'REVOKED' },
              ]}
            />
          </Form.Item>
        )}
        <Form.Item name="remarks" label="비고">
          <Input.TextArea rows={2} />
        </Form.Item>
      </FormModal>
    </Space>
  );
};

export default LicenseDetailPage;
