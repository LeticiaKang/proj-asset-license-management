import React from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Space } from 'antd';
import { DesktopOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import { assetApi } from '@/api/asset.api';
import { licenseApi } from '@/api/license.api';
import { LICENSE_TYPE_LABEL } from '@/utils/constants';
import type { AssetSummaryResponse } from '@/types/asset.types';
import type { LicenseSummaryResponse } from '@/types/license.types';

const DashboardPage: React.FC = () => {
  const { data: assetSummary = [] } = useQuery({
    queryKey: ['assets', 'summary'],
    queryFn: assetApi.getSummary,
  });

  const { data: licenseSummary = [] } = useQuery({
    queryKey: ['licenses', 'summary'],
    queryFn: licenseApi.getSummary,
  });

  const totalAssets = assetSummary.reduce((sum, s) => sum + s.totalCount, 0);
  const totalAvailable = assetSummary.reduce((sum, s) => sum + s.availableCount, 0);
  const totalInUse = assetSummary.reduce((sum, s) => sum + s.inUseCount, 0);
  const totalRepair = assetSummary.reduce((sum, s) => sum + s.repairCount, 0);

  const assetColumns: ColumnsType<AssetSummaryResponse> = [
    { title: '유형', dataIndex: 'categoryName', key: 'categoryName' },
    { title: '전체', dataIndex: 'totalCount', key: 'totalCount', width: 80, align: 'center' },
    { title: '사용가능', dataIndex: 'availableCount', key: 'availableCount', width: 80, align: 'center',
      render: (v: number) => <Tag color="green">{v}</Tag> },
    { title: '사용중', dataIndex: 'inUseCount', key: 'inUseCount', width: 80, align: 'center',
      render: (v: number) => <Tag color="blue">{v}</Tag> },
    { title: '수리중', dataIndex: 'repairCount', key: 'repairCount', width: 80, align: 'center',
      render: (v: number) => v > 0 ? <Tag color="orange">{v}</Tag> : <span>{v}</span> },
    { title: '폐기', dataIndex: 'disposedCount', key: 'disposedCount', width: 80, align: 'center',
      render: (v: number) => v > 0 ? <Tag color="red">{v}</Tag> : <span>{v}</span> },
  ];

  const licenseColumns: ColumnsType<LicenseSummaryResponse> = [
    { title: '소프트웨어', dataIndex: 'softwareName', key: 'softwareName' },
    { title: '유형', dataIndex: 'licenseType', key: 'licenseType', width: 80,
      render: (v: string) => LICENSE_TYPE_LABEL[v] || v },
    { title: '총수량', dataIndex: 'totalQty', key: 'totalQty', width: 80, align: 'center' },
    { title: '사용', dataIndex: 'usedQty', key: 'usedQty', width: 80, align: 'center' },
    { title: '잔여', dataIndex: 'remainQty', key: 'remainQty', width: 80, align: 'center',
      render: (v: number) => <Tag color={v > 0 ? 'green' : 'red'}>{v}</Tag> },
    { title: '만료 상태', dataIndex: 'expiryStatus', key: 'expiryStatus', width: 100, align: 'center',
      render: (v: string) => {
        const color = v === 'EXPIRED' ? 'red' : v === 'EXPIRING_SOON' ? 'orange' : 'green';
        const label = v === 'EXPIRED' ? '만료' : v === 'EXPIRING_SOON' ? '만료임박' : '정상';
        return <Tag color={color}>{label}</Tag>;
      },
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="전체 자산" value={totalAssets} prefix={<DesktopOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="사용가능" value={totalAvailable} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="사용중" value={totalInUse} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="수리중" value={totalRepair} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
      </Row>

      <Card title="자산 유형별 현황">
        <Table<AssetSummaryResponse>
          columns={assetColumns}
          dataSource={assetSummary}
          rowKey="categoryName"
          pagination={false}
          size="small"
        />
      </Card>

      <Card title="라이센스 현황">
        <Table<LicenseSummaryResponse>
          columns={licenseColumns}
          dataSource={licenseSummary}
          rowKey={(r) => `${r.softwareName}-${r.licenseType}`}
          pagination={false}
          size="small"
        />
      </Card>
    </Space>
  );
};

export default DashboardPage;
