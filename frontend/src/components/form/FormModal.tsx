import React from 'react';
import { Modal, Form } from 'antd';
import type { FormInstance } from 'antd';

interface FormModalProps {
  title: string;
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
  confirmLoading?: boolean;
  width?: number;
  form: FormInstance;
  children: React.ReactNode;
}

const FormModal: React.FC<FormModalProps> = ({
  title,
  open,
  onCancel,
  onOk,
  confirmLoading = false,
  width = 640,
  form,
  children,
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={confirmLoading}
      width={width}
      destroyOnClose
      afterClose={() => form.resetFields()}
      okText="저장"
      cancelText="취소"
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        {children}
      </Form>
    </Modal>
  );
};

export default FormModal;
