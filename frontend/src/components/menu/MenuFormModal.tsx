import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import FormModal from '@/components/form/FormModal';
import { menuApi } from '@/api/menu.api';
import type { MenuRequest } from '@/types/menu.types';

interface MenuFormModalProps {
  open: boolean;
  onClose: () => void;
  editingId: number | null;
  parentMenuId?: number;
  parentOptions: { label: string; value: number }[];
}

const MenuFormModal: React.FC<MenuFormModalProps> = ({
  open,
  onClose,
  editingId,
  parentMenuId,
  parentOptions,
}) => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<MenuRequest>();

  const isEditing = !!editingId;

  const { data: menuData, isLoading: isFetchingMenu } = useQuery({
    queryKey: ['menus', editingId],
    queryFn: () => menuApi.getById(editingId!),
    enabled: isEditing && open,
  });

  const saveMutation = useMutation({
    mutationFn: (values: MenuRequest) =>
      isEditing ? menuApi.update(editingId!, values) : menuApi.create(values),
    onSuccess: () => {
      message.success(isEditing ? '수정되었습니다.' : '등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      onClose();
    },
  });

  useEffect(() => {
    if (!open) return;

    if (isEditing) {
      if (menuData) {
        form.setFieldsValue({
          parentMenuId: menuData.parentMenuId,
          menuName: menuData.menuName,
          menuCode: menuData.menuCode,
          menuUrl: menuData.menuUrl ?? undefined,
          menuIcon: menuData.menuIcon ?? undefined,
          menuOrder: menuData.menuOrder,
          description: menuData.description ?? undefined,
        });
      }
    } else {
      form.resetFields();
      form.setFieldsValue({ parentMenuId });
    }
  }, [open, isEditing, menuData, parentMenuId, form]);

  const handleSave = async () => {
    const values = await form.validateFields();
    saveMutation.mutate(values);
  };

  return (
    <FormModal
      title={isEditing ? '메뉴 수정' : '메뉴 등록'}
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={saveMutation.isPending || (isEditing && isFetchingMenu)}
      form={form}
    >
      <Form.Item name="parentMenuId" label="상위 메뉴">
        <Select allowClear placeholder="최상위 메뉴" options={parentOptions} />
      </Form.Item>
      <Form.Item name="menuName" label="메뉴명" rules={[{ required: true, message: '메뉴명을 입력하세요.' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="menuCode" label="메뉴코드" rules={[{ required: true, message: '메뉴코드를 입력하세요.' }]}>
        <Input disabled={isEditing} />
      </Form.Item>
      <Form.Item name="menuUrl" label="URL">
        <Input placeholder="/example" />
      </Form.Item>
      <Form.Item name="menuIcon" label="아이콘">
        <Input placeholder="AppstoreOutlined" />
      </Form.Item>
      <Form.Item name="menuOrder" label="정렬순서" initialValue={0}>
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="description" label="설명">
        <Input.TextArea rows={2} />
      </Form.Item>
    </FormModal>
  );
};

export default MenuFormModal;
