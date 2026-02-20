export interface AssetResponse {
  assetId: number;
  categoryId: number;
  categoryName: string;
  assetName: string;
  manufacturer: string;
  modelName: string;
  serialNumber: string;
  purchaseDate: string | null;
  purchasePrice: number | null;
  warrantyStartDate: string | null;
  warrantyEndDate: string | null;
  assetStatus: string;
  memory: string;
  storage: string;
  specs: Record<string, unknown>;
  remarks: string;
  regDate: string;
}

export interface AssetRequest {
  categoryId: number;
  assetName: string;
  manufacturer?: string;
  modelName?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  memory?: string;
  storage?: string;
  specs?: Record<string, unknown>;
  remarks?: string;
}

export interface AssetSearchCondition {
  keyword?: string;
  categoryId?: number;
  assetStatus?: string;
}

export interface AssetAssignmentResponse {
  assignmentId: number;
  assetId: number;
  assetName: string;
  categoryName: string;
  memberId: number;
  memberName: string;
  assignedDate: string;
  returnDate: string | null;
  assignmentStatus: string;
  remarks: string;
}

export interface AssetAssignmentRequest {
  assetId: number;
  memberId: number;
  assignedDate: string;
  remarks?: string;
}

export interface AssetReturnRequest {
  returnDate?: string;
  remarks?: string;
}

export interface AssetTransferRequest {
  newMemberId: number;
  remarks?: string;
}

export interface AssetCategoryResponse {
  categoryId: number;
  categoryName: string;
  parentCategoryId: number | null;
  categoryOrder: number;
}

export interface AssetSummaryResponse {
  categoryName: string;
  totalCount: number;
  availableCount: number;
  inUseCount: number;
  repairCount: number;
  disposedCount: number;
}

export interface AssetHistoryResponse {
  historyId: number;
  assetId: number;
  memberId: number;
  actionType: string;
  actionDate: string;
  remarks: string;
}
