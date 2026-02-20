import React from 'react';
import { Button, Card, Form, Input } from 'antd';
import { App } from 'antd';
import { useChangePassword } from '@/hooks/useAuth';
import type { ChangePasswordRequest } from '@/types/auth.types';

interface ChangePasswordFormValues extends ChangePasswordRequest {
  confirmPassword: string;
}

const ChangePasswordPage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<ChangePasswordFormValues>();
  const changePassword = useChangePassword();

  const handleSubmit = async () => {
    const values = await form.validateFields();
    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          message.success('비밀번호가 변경되었습니다.');
          form.resetFields();
        },
      },
    );
  };

  return (
    <Card title="비밀번호 변경" style={{ maxWidth: 480, margin: '0 auto' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="currentPassword"
          label="현재 비밀번호"
          rules={[{ required: true, message: '현재 비밀번호를 입력하세요.' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="새 비밀번호"
          rules={[
            { required: true, message: '새 비밀번호를 입력하세요.' },
            { min: 8, message: '8자 이상 입력하세요.' },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="새 비밀번호 확인"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '비밀번호를 다시 입력하세요.' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={changePassword.isPending} block>
            변경
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePasswordPage;
