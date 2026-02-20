import React from 'react';
import { Table, Card, Space } from 'antd';
import type { TableProps } from 'antd';
import { PAGE_SIZE } from '@/utils/constants';

interface SearchTableProps<T> extends Omit<TableProps<T>, 'pagination' | 'title'> {
  cardTitle?: string;
  extra?: React.ReactNode;
  searchForm?: React.ReactNode;
  total?: number;
  current?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
}

function SearchTable<T extends object>({
  cardTitle,
  extra,
  searchForm,
  total = 0,
  current = 1,
  pageSize = PAGE_SIZE,
  onPageChange,
  ...tableProps
}: SearchTableProps<T>) {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {searchForm && <Card size="small">{searchForm}</Card>}
      <Card
        title={cardTitle}
        extra={extra}
        styles={{ body: { padding: 0 } }}
      >
        <Table<T>
          {...tableProps}
          pagination={{
            total,
            current,
            pageSize,
            showSizeChanger: true,
            showTotal: (t) => `총 ${t}건`,
            onChange: onPageChange,
          }}
        />
      </Card>
    </Space>
  );
}

export default SearchTable;
