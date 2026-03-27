import React from 'react';
import { Layout, Typography, Space, Divider } from 'antd';

const { Footer } = Layout;
const { Text, Link } = Typography;

const FooterBar: React.FC = () => {
  return (
    <Footer style={{ background: '#fafafa' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text type="secondary">
          Copyright ©{new Date().getFullYear()} LETICIA. All rights reserved.
        </Text>
        <Space split={<Divider type="vertical" />}>
          <Link href="#" type="secondary">
            도움말
          </Link>
          <Link href="#" type="secondary">
            개인정보처리방침
          </Link>
          <Link href="#" type="secondary">
            이용약관
          </Link>
        </Space>
      </div>
    </Footer>
  );
};

export default FooterBar;
