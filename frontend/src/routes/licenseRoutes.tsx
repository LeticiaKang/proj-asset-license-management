import { Route } from 'react-router-dom';
import PermissionRoute from '@/routes/PermissionRoute';
import SoftwareManagePage from '@/pages/license/SoftwareManagePage';
import LicenseListPage from '@/pages/license/LicenseListPage';
import LicenseDetailPage from '@/pages/license/LicenseDetailPage';
import LicenseAssignPage from '@/pages/license/LicenseAssignPage';

const licenseRoutes = (
  <>
    <Route
      path="softwares"
      element={
        <PermissionRoute requiredMenu="/softwares">
          <SoftwareManagePage />
        </PermissionRoute>
      }
    />
    <Route
      path="licenses"
      element={
        <PermissionRoute requiredMenu="/licenses">
          <LicenseListPage />
        </PermissionRoute>
      }
    />
    <Route
      path="licenses/:id"
      element={
        <PermissionRoute requiredMenu="/licenses">
          <LicenseDetailPage />
        </PermissionRoute>
      }
    />
    <Route
      path="license-assignments"
      element={
        <PermissionRoute requiredMenu="/license-assignments">
          <LicenseAssignPage />
        </PermissionRoute>
      }
    />
  </>
);

export default licenseRoutes;
