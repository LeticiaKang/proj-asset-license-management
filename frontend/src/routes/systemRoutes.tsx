import { Route } from 'react-router-dom';
import PermissionRoute from '@/routes/PermissionRoute';
import MenuManagePage from '@/pages/menu/MenuManagePage';
import RoleManagePage from '@/pages/role/RoleManagePage';
import CommonCodeManagePage from '@/pages/commoncode/CommonCodeManagePage';

const systemRoutes = (
  <>
    <Route
      path="menus"
      element={
        <PermissionRoute requiredMenu="/menus">
          <MenuManagePage />
        </PermissionRoute>
      }
    />
    <Route
      path="roles"
      element={
        <PermissionRoute requiredMenu="/roles">
          <RoleManagePage />
        </PermissionRoute>
      }
    />
    <Route
      path="common-codes"
      element={
        <PermissionRoute requiredMenu="/common-codes">
          <CommonCodeManagePage />
        </PermissionRoute>
      }
    />
  </>
);

export default systemRoutes;
