
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/apiClient';
import { globalCache } from '../utils/queryUtils';

interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  initialData?: T;
  enabled?: boolean;
  cacheKey?: string; // If provided, enables SWR caching
  staleTime?: number; 
}

export function useFetch<T>(endpoint: string | null, options: UseFetchOptions<T> = {}) {
  const { onSuccess, onError, initialData, enabled = true, cacheKey } = options;
  
  // Try to get from cache first if a key is provided
  const cachedData = cacheKey || endpoint ? globalCache.get<T>(cacheKey || endpoint!) : null;

  const [data, setData] = useState<T | null>(cachedData || initialData || null);
  // If we have cached data, we are not "loading" in the blocking sense, but we might be "fetching" in background
  const [loading, setLoading] = useState<boolean>(!cachedData && enabled && !!endpoint && !initialData);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const optionsRef = useRef(options);
  useEffect(() => { optionsRef.current = options; }, [options]);

  const fetchData = useCallback(async (url: string, signal?: AbortSignal, isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setIsRefetching(true);
    
    setError(null);
    try {
      const res = await apiClient.get<T>(url, {}, { signal });
      
      if (signal?.aborted) return;

      if (res.status) {
        setData(res.data);
        // Update cache
        if (cacheKey || endpoint) {
          globalCache.set(cacheKey || endpoint!, res.data);
        }
        optionsRef.current.onSuccess?.(res.data);
      } else {
        const msg = res.message || 'Failed to fetch data';
        setError(msg);
        optionsRef.current.onError?.(msg);
      }
    } catch (err: any) {
      if (signal?.aborted) return;
      if (err.name === 'CanceledError') return;

      const msg = err.message || 'Network error';
      setError(msg);
      optionsRef.current.onError?.(msg);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setIsRefetching(false);
      }
    }
  }, [cacheKey, endpoint]);

  useEffect(() => {
    const controller = new AbortController();

    if (endpoint && enabled) {
      // SWR Logic: If we have data, fetch in background. If not, fetch immediately (blocking load).
      const hasData = !!data; 
      fetchData(endpoint, controller.signal, hasData);
    } else {
        if (!enabled && !initialData) setLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [endpoint, enabled, fetchData]);

  const refetch = useCallback(() => {
    if (endpoint) return fetchData(endpoint, undefined, false);
    return Promise.resolve();
  }, [endpoint, fetchData]);

  // Expose setData so local optimistic updates can modify the state/cache
  const mutate = (newData: T | ((prev: T | null) => T | null)) => {
    setData((prev) => {
        const updated = typeof newData === 'function' ? (newData as any)(prev) : newData;
        if (cacheKey || endpoint) globalCache.set(cacheKey || endpoint!, updated);
        return updated;
    });
  };

  return { data, loading, isRefetching, error, refetch, setData: mutate };
}
