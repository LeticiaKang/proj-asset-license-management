import React from 'react';
import { Layout, Typography, Breadcrumb } from 'antd';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useMenuStore } from '@/store/menuStore';
import { BREADCRUMB_MAP } from '@/utils/constants';
import HeaderBar from './HeaderBar';
import MenuTree from './MenuTree';

const { Sider, Content } = Layout;

const AppLayout: React.FC = () => {
  const { collapsed } = useMenuStore();
  const location = useLocation();

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = [
    { title: <Link to="/">홈</Link> },
    ...pathSegments.map((_, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = BREADCRUMB_MAP[path] ?? pathSegments[index];
      const isLast = index === pathSegments.length - 1;
      return {
        title: isLast ? label : <Link to={path}>{label}</Link>,
      };
    }),
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{ background: '#fff' }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Typography.Title level={5} style={{ margin: 0 }}>
            {collapsed ? 'IT' : 'IT 자산관리'}
          </Typography.Title>
        </div>
        <MenuTree />
      </Sider>
      <Layout>
        <HeaderBar />
        <Content style={{ margin: 24 }}>
          {pathSegments.length > 0 && (
            <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
          )}
          <div
            style={{
              padding: 24,
              background: '#fff',
              borderRadius: 8,
              minHeight: 280,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
