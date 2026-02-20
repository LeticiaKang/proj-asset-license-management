export interface LicenseResponse {
  licenseId: number;
  softwareId: number;
  softwareName: string;
  licenseType: string;
  licenseVersion: string;
  totalQty: number;
  usedQty: number;
  remainQty: number;
  purchaseDate: string | null;
  expiryDate: string | null;
  purchasePrice: number | null;
  remarks: string;
  isActive: boolean;
  regDate: string;
}

export interface LicenseDetailResponse extends LicenseResponse {
  installGuide: string;
  keys: LicenseKeyResponse[];
}

export interface LicenseRequest {
  softwareId: number;
  licenseType: string;
  licenseVersion?: string;
  totalQty: number;
  purchaseDate?: string;
  expiryDate?: string;
  purchasePrice?: number;
  installGuide?: string;
  remarks?: string;
}

export interface LicenseSearchCondition {
  keyword?: string;
  licenseType?: string;
  softwareId?: number;
}

export interface LicenseKeyResponse {
  keyId: number;
  licenseId: number;
  licenseKey: string;
  keyStatus: string;
  remarks: string;
}

export interface LicenseKeyRequest {
  licenseKey: string;
  keyStatus?: string;
  remarks?: string;
}

export interface LicenseAssignmentResponse {
  assignmentId: number;
  licenseId: number;
  softwareName: string;
  licenseVersion: string;
  licenseType: string;
  keyId: number | null;
  memberId: number;
  memberName: string;
  assignedDate: string;
  returnDate: string | null;
  assignmentReason: string;
  assignmentStatus: string;
  remarks: string;
}

export interface LicenseAssignmentRequest {
  licenseId: number;
  memberId: number;
  keyId?: number;
  assignedDate: string;
  assignmentReason: string;
  remarks?: string;
}

export interface LicenseReturnRequest {
  remarks?: string;
}

export interface LicenseSummaryResponse {
  softwareName: string;
  licenseType: string;
  totalQty: number;
  usedQty: number;
  remainQty: number;
  expiryStatus: string;
}
