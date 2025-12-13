export type SortDirection = 'asc' | 'desc';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SortParams {
  field: string;
  direction: SortDirection;
}

export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

export interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export type Status = 0 | 1;