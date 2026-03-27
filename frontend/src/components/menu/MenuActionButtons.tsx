import React from 'react';
import { Button, Space, Popconfirm, App } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePermission } from '@/hooks/usePermission';
import { menuApi } from '@/api/menu.api';
import type { MenuResponse } from '@/types/menu.types';

interface MenuActionButtonsProps {
  record: MenuResponse;
  onAddChild: (id: number) => void;
  onEdit: (record: MenuResponse) => void;
}

const MenuActionButtons: React.FC<MenuActionButtonsProps> = ({ record, onAddChild, onEdit }) => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission(); // 현재 로그인된 사용자가 특정 작업을 수행할 권한이 있는지 확인

  const deleteMutation = useMutation({
    mutationFn: menuApi.delete,
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });

  return (
    <Space size="small">
      {hasPermission('/menus', 'CREATE') && (
        <Button size="small" onClick={() => onAddChild(record.menuId)}>
          추가
        </Button>
      )}
      {hasPermission('/menus', 'UPDATE') && (
        <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
      )}
      {hasPermission('/menus', 'DELETE') && (
        <Popconfirm title="삭제하시겠습니까?" onConfirm={() => deleteMutation.mutate(record.menuId)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )}
    </Space>
  );
};

export default MenuActionButtons;
