import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useLogin } from '@/hooks/useAuth';

const { Title } = Typography;

//useState는 함수형 컴포넌트가 '상태'(state)라는 자신만의 '기억'을 가질 수 있게 해주는 가장 중요한 Hook(훅)
const LoginPage: React.FC = () => {
  // loginId는 현재 '아이디' 입력값을 저장하는 변수이고, 
  // setLoginId는 이 loginId 값을 변경할 수 있는 유일한 함수
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState(''); //useState('') 처럼 괄호 안에 넣어준 값은 이 상태의 '초기값'

  const loginMutation = useLogin();

  const handleLogin = () => {
    // 간단한 유효성 검사
    if (!loginId || !password) {
      alert('아이디와 비밀번호를 모두 입력하세요.');
      return;
    }
    loginMutation.mutate({ loginId, password });
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
          IT 자산 & 라이센스 관리
        </Title>
        <Form autoComplete="off" size="large">
          <Form.Item>
            <Input
              prefix={<UserOutlined />}
              placeholder="아이디"
              value={loginId} // Input의 값을 항상 React의 loginId 상태 변수가 가진 값으로 강제합니다
              onChange={(e) => setLoginId(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              loading={loginMutation.isPending}
              onClick={handleLogin}
              block
            >
              로그인
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
