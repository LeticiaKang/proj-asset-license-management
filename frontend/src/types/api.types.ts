/** 공통 API 성공 응답 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorCode?: string;
  timestamp: string;
}

/** 페이징 응답 (Spring Data Page) */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/** 페이징 요청 파라미터 */
export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
}

/** Select/Dropdown 옵션 */
export interface SelectOption {
  label: string;
  value: string | number;
}

/** API 에러 응답 */
export interface ErrorResponse {
  success: false;
  data: null;
  message: string;
  errorCode: string;
  timestamp: string;
}
