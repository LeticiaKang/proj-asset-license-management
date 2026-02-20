import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="403"
      subTitle="접근 권한이 없습니다. 관리자에게 문의하세요."
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          홈으로 돌아가기
        </Button>
      }
    />
  );
};

export default ForbiddenPage;
