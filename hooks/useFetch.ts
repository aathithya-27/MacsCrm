import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/apiClient';

interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  initialData?: T;
  enabled?: boolean;
}

export function useFetch<T>(endpoint: string | null, options: UseFetchOptions<T> = {}) {
  const { onSuccess, onError, initialData, enabled = true } = options;
  const [data, setData] = useState<T | null>(initialData || null);
  const [loading, setLoading] = useState<boolean>(enabled && !!endpoint && !initialData);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to keep latest options without triggering re-renders
  const optionsRef = useRef(options);
  useEffect(() => { optionsRef.current = options; }, [options]);

  const fetchData = useCallback(async (url: string, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      // Pass signal to axios config if supported in future, currently handled via logic check
      const res = await apiClient.get<T>(url, { signal });
      
      if (signal?.aborted) return;

      if (res.status) {
        setData(res.data);
        optionsRef.current.onSuccess?.(res.data);
      } else {
        const msg = res.message || 'Failed to fetch data';
        setError(msg);
        optionsRef.current.onError?.(msg);
      }
    } catch (err: any) {
      if (signal?.aborted) return;
      if (err.name === 'CanceledError') return; // Axios specific

      const msg = err.message || 'Network error';
      setError(msg);
      optionsRef.current.onError?.(msg);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    if (endpoint && enabled) {
      fetchData(endpoint, controller.signal);
    } else {
        if (!enabled && !initialData) setLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [endpoint, enabled, fetchData, initialData]);

  const refetch = useCallback(() => {
    if (endpoint) return fetchData(endpoint);
    return Promise.resolve();
  }, [endpoint, fetchData]);

  return { data, loading, error, refetch, setData };
}