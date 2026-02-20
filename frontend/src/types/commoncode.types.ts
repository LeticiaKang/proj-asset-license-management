export interface CodeGroupResponse {
  groupCode: string;
}

export interface CommonCodeResponse {
  codeId: number;
  groupCode: string;
  code: string;
  codeName: string;
  codeOrder: number;
  description: string | null;
  isActive: boolean;
}

export interface CommonCodeRequest {
  groupCode: string;
  code: string;
  codeName: string;
  codeOrder?: number;
  description?: string;
}
