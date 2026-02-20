import client from './client';
import type { ApiResponse, PageResponse, PageRequest } from '@/types/api.types';
import type {
  LicenseResponse,
  LicenseDetailResponse,
  LicenseRequest,
  LicenseSearchCondition,
  LicenseKeyResponse,
  LicenseKeyRequest,
  LicenseAssignmentResponse,
  LicenseAssignmentRequest,
  LicenseReturnRequest,
  LicenseSummaryResponse,
} from '@/types/license.types';
import type { MemberAssignmentDetail } from '@/types/member.types';

export const licenseApi = {
  search: (params: LicenseSearchCondition & PageRequest) =>
    client
      .get<ApiResponse<PageResponse<LicenseResponse>>>('/licenses', { params })
      .then((r) => r.data.data),

  getById: (id: number) =>
    client
      .get<ApiResponse<LicenseDetailResponse>>(`/licenses/${id}`)
      .then((r) => r.data.data),

  create: (data: LicenseRequest) =>
    client.post<ApiResponse<LicenseResponse>>('/licenses', data).then((r) => r.data.data),

  update: (id: number, data: LicenseRequest) =>
    client.put<ApiResponse<LicenseResponse>>(`/licenses/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    client.delete<ApiResponse<null>>(`/licenses/${id}`).then((r) => r.data),

  getKeys: (licenseId: number) =>
    client
      .get<ApiResponse<LicenseKeyResponse[]>>(`/licenses/${licenseId}/keys`)
      .then((r) => r.data.data),

  createKey: (licenseId: number, data: LicenseKeyRequest) =>
    client
      .post<ApiResponse<LicenseKeyResponse>>(`/licenses/${licenseId}/keys`, data)
      .then((r) => r.data.data),

  updateKey: (keyId: number, data: LicenseKeyRequest) =>
    client
      .put<ApiResponse<LicenseKeyResponse>>(`/licenses/keys/${keyId}`, data)
      .then((r) => r.data.data),

  getSummary: () =>
    client
      .get<ApiResponse<LicenseSummaryResponse[]>>('/licenses/summary')
      .then((r) => r.data.data),
};

export const licenseAssignmentApi = {
  search: (params: PageRequest) =>
    client
      .get<ApiResponse<PageResponse<LicenseAssignmentResponse>>>('/license-assignments', {
        params,
      })
      .then((r) => r.data.data),

  assign: (data: LicenseAssignmentRequest) =>
    client
      .post<ApiResponse<LicenseAssignmentResponse>>('/license-assignments', data)
      .then((r) => r.data.data),

  return: (assignmentId: number, data: LicenseReturnRequest) =>
    client
      .put<ApiResponse<null>>(`/license-assignments/${assignmentId}/return`, data)
      .then((r) => r.data),

  update: (assignmentId: number, data: LicenseAssignmentRequest) =>
    client
      .put<ApiResponse<LicenseAssignmentResponse>>(`/license-assignments/${assignmentId}`, data)
      .then((r) => r.data.data),

  getMemberDetail: (memberId: number) =>
    client
      .get<ApiResponse<MemberAssignmentDetail>>(`/license-assignments/members/${memberId}`)
      .then((r) => r.data.data),
};
