import React from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Space } from 'antd';
import { DesktopOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';  //데이터를 가져오고 관리
import type { ColumnsType } from 'antd/es/table';
import { assetApi } from '@/api/asset.api';
import { licenseApi } from '@/api/license.api';
import { LICENSE_TYPE_LABEL } from '@/utils/constants';
import type { AssetSummaryResponse } from '@/types/asset.types';
import type { LicenseSummaryResponse } from '@/types/license.types';

const DashboardPage: React.FC = () => {
  /*
   * API
   */
  const { data: assetSummary = [] } = useQuery({
    queryKey: ['assets', 'summary'],
    queryFn: assetApi.getSummary,
  });

  const { data: licenseSummary = [] } = useQuery({
    queryKey: ['licenses', 'summary'],
    queryFn: licenseApi.getSummary,
  });

  /*
   * 변수 
   * 배열을 한 번만 순회하여 모든 합계를 계산하도록
   */
  const { totalAssets, totalAvailable, totalInUse, totalRepair } = assetSummary.reduce(
    (acc, summary) => {
      acc.totalAssets += summary.totalCount;
      acc.totalAvailable += summary.availableCount;
      acc.totalInUse += summary.inUseCount;
      acc.totalRepair += summary.repairCount;
      return acc;
    },
    { totalAssets: 0, totalAvailable: 0, totalInUse: 0, totalRepair: 0 },
  );

  /*
   * 자산 유형별 현황 list
   */
  const assetColumns: ColumnsType<AssetSummaryResponse> = [
    { title: '유형', dataIndex: 'categoryName', key: 'categoryName', width: 100, align: 'center' },
    { title: '전체', dataIndex: 'totalCount', key: 'totalCount', width: 80, align: 'center' },
    { title: '사용중', dataIndex: 'inUseCount', key: 'inUseCount', width: 80, align: 'center'},
    { title: '사용가능', dataIndex: 'availableCount', key: 'availableCount', width: 80, align: 'center',
      render: (v: number) => <Tag color="green">{v}</Tag> },
    { title: '수리중', dataIndex: 'repairCount', key: 'repairCount', width: 80, align: 'center',
      render: (v: number) => v > 0 ? <Tag color="orange">{v}</Tag> : <span>{v}</span> },
    { title: '폐기', dataIndex: 'disposedCount', key: 'disposedCount', width: 80, align: 'center',
      render: (v: number) => v > 0 ? <Tag color="red">{v}</Tag> : <span>{v}</span> },
  ];

  /*
   * 라이센스 현황 list
   */
  const licenseColumns: ColumnsType<LicenseSummaryResponse> = [
    { title: '소프트웨어', dataIndex: 'softwareName', key: 'softwareName', width:100, align: 'center', 
      render: (_: string, record: any) => (
        <span>
          {record.softwareName} ({record.licenseVersion && `${record.licenseVersion}`})
        </span>
      ),
    },
    { title: '유형', dataIndex: 'licenseType', key: 'licenseType', width: 80, align: 'center',
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
        {/* Table 컴포넌트는 이제 dataSource로 들어오는 데이터가 LicenseSummaryResponse 타입의 객체들로 이루어진 배열임을 명시
            타입 안정성 */}
        <Table<LicenseSummaryResponse>
          columns={licenseColumns}
          dataSource={licenseSummary}
          rowKey="licenseId"
          pagination={false}
          size="small"
        />
      </Card>
    </Space>
  );
};

export default DashboardPage;
