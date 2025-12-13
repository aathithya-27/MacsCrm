export interface ApiResult<T> {
  status: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  code?: string;
  message: string;
  details?: any;
}