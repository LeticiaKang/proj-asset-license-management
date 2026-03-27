import { Route } from 'react-router-dom';
import PermissionRoute from '@/routes/PermissionRoute';
import AssetCategoryPage from '@/pages/asset/AssetCategoryPage';
import AssetListPage from '@/pages/asset/AssetListPage';
import AssetDetailPage from '@/pages/asset/AssetDetailPage';
import AssetAssignPage from '@/pages/asset/AssetAssignPage';

const assetRoutes = (
  <>
    <Route
      path="assets/categories"
      element={
        <PermissionRoute requiredMenu="/assets/categories">
          <AssetCategoryPage />
        </PermissionRoute>
      }
    />
    <Route
      path="assets"
      element={
        <PermissionRoute requiredMenu="/assets">
          <AssetListPage />
        </PermissionRoute>
      }
    />
    <Route
      path="assets/:id"
      element={
        <PermissionRoute requiredMenu="/assets">
          <AssetDetailPage />
        </PermissionRoute>
      }
    />
    <Route
      path="asset-assignments"
      element={
        <PermissionRoute requiredMenu="/asset-assignments">
          <AssetAssignPage />
        </PermissionRoute>
      }
    />
  </>
);

export default assetRoutes;
