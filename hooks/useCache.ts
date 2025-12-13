import { useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function useCache<T>() {
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > DEFAULT_TTL;
    if (isExpired) {
      cache.current.delete(key);
      return null;
    }

    return entry.data;
  }, []);

  const set = useCallback((key: string, data: T) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  const clear = useCallback(() => {
    cache.current.clear();
  }, []);

  const remove = useCallback((key: string) => {
      cache.current.delete(key);
  }, []);

  return { get, set, clear, remove };
}