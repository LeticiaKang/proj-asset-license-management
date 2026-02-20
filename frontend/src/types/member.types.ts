export interface MemberResponse {
  memberId: number;
  loginId: string;
  memberName: string;
  deptId: number;
  position: string;
  jobTitle: string;
  hireDate: string;
  resignDate: string | null;
  employmentStatus: string;
  workLocation: string;
  email: string;
  phone: string;
  isActive: boolean;
  regDate: string;
}

export interface MemberRequest {
  loginId: string;
  password?: string;
  memberName: string;
  deptId: number;
  position: string;
  jobTitle?: string;
  hireDate: string;
  workLocation: string;
  email?: string;
  phone?: string;
}

export interface MemberRoleResponse {
  memberRoleId: number;
  memberId: number;
  roleId: number;
}

export interface MemberRoleRequest {
  roleIds: number[];
}

export interface MemberSearchCondition {
  keyword?: string;
  deptId?: number;
  employmentStatus?: string;
}

export interface MemberAssignmentDetail {
  userInfo: {
    memberId: number;
    memberName: string;
    loginId: string;
    deptId: number;
    hireDate: string;
    resignDate: string | null;
  };
  assetAssignments: AssetAssignmentItem[];
  licenseAssignments: LicenseAssignmentItem[];
}

export interface AssetAssignmentItem {
  assignmentId: number;
  categoryName: string;
  assetName: string;
  manufacturer: string;
  modelName: string;
  assignedDate: string;
}

export interface LicenseAssignmentItem {
  assignmentId: number;
  softwareName: string;
  licenseVersion: string;
  licenseType: string;
  assignedDate: string;
  assignmentReason: string;
}
