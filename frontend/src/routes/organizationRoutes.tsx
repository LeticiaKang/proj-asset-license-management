import { Route } from 'react-router-dom';
import PermissionRoute from '@/routes/PermissionRoute';
import DeptManagePage from '@/pages/dept/DeptManagePage';
import MemberManagePage from '@/pages/member/MemberManagePage';

const organizationRoutes = (
  <>
    <Route
      path="departments"
      element={
        <PermissionRoute requiredMenu="/departments">
          <DeptManagePage />
        </PermissionRoute>
      }
    />
    <Route
      path="members"
      element={
        <PermissionRoute requiredMenu="/members">
          <MemberManagePage />
        </PermissionRoute>
      }
    />
  </>
);

export default organizationRoutes;
