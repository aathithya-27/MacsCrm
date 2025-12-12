
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
      // Note: passing signal to apiClient requires the client to support it. 
      // Assuming underlying axios call can accept signal via config if passed properly.
      // For now, we handle the 'mounted' state check in the effect which is the React way.
      const res = await apiClient.get<T>(url);
      
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
        if (!enabled) setLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [endpoint, enabled, fetchData]);

  const refetch = () => {
    if (endpoint) fetchData(endpoint);
  };

  return { data, loading, error, refetch, setData };
}
