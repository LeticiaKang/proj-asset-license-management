export interface SoftwareResponse {
  softwareId: number;
  softwareName: string;
  publisher: string | null;
  description: string | null;
  isActive: boolean;
  regDate: string;
}

export interface SoftwareRequest {
  softwareName: string;
  publisher?: string;
  description?: string;
}
