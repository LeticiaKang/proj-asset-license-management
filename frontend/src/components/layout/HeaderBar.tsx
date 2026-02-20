import React from 'react';
import { Layout, Dropdown, Space, Typography } from 'antd';
import { LogoutOutlined, UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { useMenuStore } from '@/store/menuStore';
import { useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Header } = Layout;

const HeaderBar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { collapsed, setCollapsed } = useMenuStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const items: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      {React.createElement(
        collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
        {
          style: { fontSize: 18, cursor: 'pointer' },
          onClick: () => setCollapsed(!collapsed),
        },
      )}
      <Dropdown menu={{ items }} placement="bottomRight">
        <Space style={{ cursor: 'pointer' }}>
          <UserOutlined />
          <Typography.Text>{user?.memberName ?? '사용자'}</Typography.Text>
        </Space>
      </Dropdown>
    </Header>
  );
};

export default HeaderBar;
