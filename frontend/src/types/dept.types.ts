export interface DeptResponse {
  deptId: number;
  parentDeptId: number | null;
  deptName: string;
  deptCode: string;
  deptOrder: number;
  deptDepth: number;
  deptPath: string | null;
  isActive: boolean;
  children: DeptResponse[];
}

export interface DeptRequest {
  parentDeptId?: number | null;
  deptName: string;
  deptCode: string;
  deptOrder?: number;
}

export interface DeptMoveRequest {
  newParentDeptId: number | null;
}
