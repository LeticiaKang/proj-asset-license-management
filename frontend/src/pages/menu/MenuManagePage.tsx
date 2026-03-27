import React, { useState, useMemo } from 'react';
import { Button, Tag } from 'antd';
import { DownOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import SearchTable from '@/components/table/SearchTable';
import { menuApi } from '@/api/menu.api';
import { usePermission } from '@/hooks/usePermission';
import type { MenuResponse } from '@/types/menu.types';
import MenuFormModal from '@/components/menu/MenuFormModal';
import MenuActionButtons from '@/components/menu/MenuActionButtons';

// Helper function can be moved to a utils file
const flattenMenus = (items: MenuResponse[], depth = 0): { label: string; value: number }[] => {
  const result: { label: string; value: number }[] = [];
  items.forEach((item) => {
    result.push({ label: `${'ㄴ'.repeat(depth)} ${item.menuName}`.trim(), value: item.menuId });
    if (item.children?.length) {
      result.push(...flattenMenus(item.children, depth + 1));
    }
  });
  return result;
};

const MenuManagePage: React.FC = () => {
  const { hasPermission } = usePermission();
  const [modalOpen, setModalOpen] = useState(false); // 모달 상태 관리

  // editingId가 null이면 새 메뉴 등록, 그렇지 않으면 해당 ID의 메뉴 수정
  const [activeMenu, setActiveMenu] = useState<{
    editingId: number | null;
    parentMenuId?: number;
  }>({ editingId: null }); // 모달 열 때, 메뉴아이디 전달

  /* useQuery : API */
  const { data: menus = [], isLoading } = useQuery({
    queryKey: ['menus'],
    queryFn: menuApi.getTree,
  });

  /* UseMemo */ 
  // 데이터 가공 / 데이터가 변경될 때만 작업 수행
  const parentOptions = useMemo(() => flattenMenus(menus), [menus]);

  /* Functions */

  // [등록] / [추가] 버튼 이벤트 함수
  const handleOpenModalForCreate = (parentMenuId?: number) => {
    setActiveMenu({ editingId: null, parentMenuId });
    setModalOpen(true);
  };

  // [수정] 버튼 이벤트 함수
  const handleOpenModalForEdit = (record: MenuResponse) => {
    setActiveMenu({ editingId: record.menuId }); //activeMenu상태 수정으로 업데이트
    setModalOpen(true);
  };

  // 모달 닫는 함수 (공통)
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const columns: ColumnsType<MenuResponse> = [
    { title: '메뉴명', dataIndex: 'menuName', key: 'menuName', width: 150 },
    { title: '메뉴코드', dataIndex: 'menuCode', key: 'menuCode', width: 150, align: 'center' },
    { title: 'URL', dataIndex: 'menuUrl', key: 'menuUrl', width: 180, align: 'center' },
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
      width: 200,
      render: (_, record) => (
        // 각 행의 관리열 버튼 컴포넌트
        <MenuActionButtons
          record={record}
          onAddChild={handleOpenModalForCreate}
          onEdit={handleOpenModalForEdit}
        />
      ),
    },
  ];

  return (
    <>
      <SearchTable<MenuResponse>
        cardTitle="메뉴 관리"
        extra={
          hasPermission('/menus', 'CREATE') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModalForCreate()}>
              등록
            </Button>
          )
        }
        columns={columns}
        dataSource={menus}
        rowKey="menuId"
        loading={isLoading}
        pagination={false}
        expandable={{
          childrenColumnName: 'children',
          expandIcon: ({ expanded, onExpand, record }) => {
            //_ record.children이 존재하고, 비어있지 않은 배열인 경우 (하위 메뉴가 있는 경우)
            if (record.children && record.children.length > 0) {
              // expanded 상태에 따라 열림/닫힘 아이콘을 보여줍니다.
              return expanded ? (
                <DownOutlined onClick={e => onExpand(record, e)} style={{ marginRight: 8 }} />
              ) : (
                <RightOutlined onClick={e => onExpand(record, e)} style={{ marginRight: 8 }} />
              );
            } else {
              // 하위 메뉴가 없는 경우, • 기호
              return <span style={{ marginRight: 23, marginLeft: 5 }}>●</span>;
            }
          }
        }}
      />

      {modalOpen && (
        <MenuFormModal
          open={modalOpen}
          onClose={handleCloseModal}
          editingId={activeMenu.editingId}
          parentMenuId={activeMenu.parentMenuId}
          parentOptions={parentOptions}
        />
      )}
    </>
  );
};

export default MenuManagePage;
