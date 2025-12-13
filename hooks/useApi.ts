import { useState, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import { ApiResult } from '../types/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async <T>(
    promise: Promise<ApiResult<T>>
  ): Promise<ApiResult<T>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await promise;
      if (!result.status) {
        setError(result.message || 'Operation failed');
      }
      return result;
    } catch (err: any) {
      const msg = err.message || 'Unexpected error';
      setError(msg);
      return { status: false, message: msg, data: null as unknown as T };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    execute,
    client: apiClient
  };
}