import client from './client';
import type { ApiResponse, PageResponse, PageRequest } from '@/types/api.types';
import type {
  AssetResponse,
  AssetRequest,
  AssetSearchCondition,
  AssetAssignmentResponse,
  AssetAssignmentRequest,
  AssetReturnRequest,
  AssetTransferRequest,
  AssetCategoryResponse,
  AssetCategoryRequest,
  AssetSummaryResponse,
  AssetHistoryResponse,
} from '@/types/asset.types';
import type { MemberAssignmentDetail } from '@/types/member.types';

export const assetApi = {
  search: (params: AssetSearchCondition & PageRequest) =>
    client
      .get<ApiResponse<PageResponse<AssetResponse>>>('/assets', { params })
      .then((r) => r.data.data),

  getById: (id: number) =>
    client.get<ApiResponse<AssetResponse>>(`/assets/${id}`).then((r) => r.data.data),

  create: (data: AssetRequest) =>
    client.post<ApiResponse<AssetResponse>>('/assets', data).then((r) => r.data.data),

  update: (id: number, data: AssetRequest) =>
    client.put<ApiResponse<AssetResponse>>(`/assets/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    client.delete<ApiResponse<null>>(`/assets/${id}`).then((r) => r.data),

  getHistory: (assetId: number) =>
    client
      .get<ApiResponse<AssetHistoryResponse[]>>(`/assets/${assetId}/history`)
      .then((r) => r.data.data),

  getCategories: () =>
    client
      .get<ApiResponse<AssetCategoryResponse[]>>('/assets/categories')
      .then((r) => r.data.data),

  createCategory: (data: AssetCategoryRequest) =>
    client
      .post<ApiResponse<AssetCategoryResponse>>('/assets/categories', data)
      .then((r) => r.data.data),

  updateCategory: (id: number, data: AssetCategoryRequest) =>
    client
      .put<ApiResponse<AssetCategoryResponse>>(`/assets/categories/${id}`, data)
      .then((r) => r.data.data),

  deleteCategory: (id: number) =>
    client.delete<ApiResponse<null>>(`/assets/categories/${id}`).then((r) => r.data),

  getSummary: () =>
    client
      .get<ApiResponse<AssetSummaryResponse[]>>('/assets/summary')
      .then((r) => r.data.data),
};

export const assetAssignmentApi = {
  search: (params: PageRequest) =>
    client
      .get<ApiResponse<PageResponse<AssetAssignmentResponse>>>('/asset-assignments', { params })
      .then((r) => r.data.data),

  assign: (data: AssetAssignmentRequest) =>
    client
      .post<ApiResponse<AssetAssignmentResponse>>('/asset-assignments', data)
      .then((r) => r.data.data),

  return: (assignmentId: number, data: AssetReturnRequest) =>
    client
      .put<ApiResponse<null>>(`/asset-assignments/${assignmentId}/return`, data)
      .then((r) => r.data),

  transfer: (assignmentId: number, data: AssetTransferRequest) =>
    client
      .put<ApiResponse<null>>(`/asset-assignments/${assignmentId}/transfer`, data)
      .then((r) => r.data),

  getMemberDetail: (memberId: number) =>
    client
      .get<ApiResponse<MemberAssignmentDetail>>(`/asset-assignments/members/${memberId}`)
      .then((r) => r.data.data),
};
