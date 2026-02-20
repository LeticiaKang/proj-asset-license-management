import React from 'react';
import { Button, Card, Descriptions, Space, Spin, Table, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import { assetApi } from '@/api/asset.api';
import { STATUS_COLOR, STATUS_LABEL, ACTION_TYPE_LABEL } from '@/utils/constants';
import type { AssetHistoryResponse } from '@/types/asset.types';

const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: asset, isLoading } = useQuery({
    queryKey: ['assets', id],
    queryFn: () => assetApi.getById(Number(id)),
    enabled: !!id,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['assets', id, 'history'],
    queryFn: () => assetApi.getHistory(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return <Spin style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;
  }

  if (!asset) return null;

  const historyColumns: ColumnsType<AssetHistoryResponse> = [
    {
      title: '액션',
      dataIndex: 'actionType',
      key: 'actionType',
      width: 100,
      render: (v: string) => ACTION_TYPE_LABEL[v] || v,
    },
    { title: '일시', dataIndex: 'actionDate', key: 'actionDate', width: 180 },
    { title: '비고', dataIndex: 'remarks', key: 'remarks' },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card
        title="자산 상세"
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            목록
          </Button>
        }
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="자산명">{asset.assetName}</Descriptions.Item>
          <Descriptions.Item label="유형">{asset.categoryName}</Descriptions.Item>
          <Descriptions.Item label="제조사">{asset.manufacturer}</Descriptions.Item>
          <Descriptions.Item label="모델명">{asset.modelName}</Descriptions.Item>
          <Descriptions.Item label="시리얼번호">{asset.serialNumber}</Descriptions.Item>
          <Descriptions.Item label="상태">
            <Tag color={STATUS_COLOR[asset.assetStatus]}>
              {STATUS_LABEL[asset.assetStatus] || asset.assetStatus}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="구매일">{asset.purchaseDate ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="구매가격">
            {asset.purchasePrice != null ? `${asset.purchasePrice.toLocaleString()}원` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="보증 시작일">{asset.warrantyStartDate ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="보증 종료일">{asset.warrantyEndDate ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="메모리">{asset.memory || '-'}</Descriptions.Item>
          <Descriptions.Item label="저장장치">{asset.storage || '-'}</Descriptions.Item>
          <Descriptions.Item label="비고" span={2}>{asset.remarks || '-'}</Descriptions.Item>
          {asset.specs && Object.keys(asset.specs).length > 0 && (
            <Descriptions.Item label="추가 사양" span={2}>
              {Object.entries(asset.specs).map(([key, value]) => (
                <Tag key={key}>{`${key}: ${value}`}</Tag>
              ))}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="등록일">{asset.regDate}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="배정 이력">
        <Table<AssetHistoryResponse>
          columns={historyColumns}
          dataSource={history}
          rowKey="historyId"
          pagination={false}
          size="small"
        />
      </Card>
    </Space>
  );
};

export default AssetDetailPage;
