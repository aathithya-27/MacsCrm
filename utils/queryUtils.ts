
export const toQueryString = (params: Record<string, any>): string => {
  const parts: string[] = [];
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  });
  return parts.length > 0 ? `?${parts.join('&')}` : '';
};

// Simple in-memory cache registry
// We store promises to dedup in-flight requests and data for SWR
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cacheRegistry = new Map<string, CacheEntry<any>>();

export const globalCache = {
  get: <T>(key: string): T | null => {
    const entry = cacheRegistry.get(key);
    if (!entry) return null;
    // Default 5 minute cache for master data
    if (Date.now() - entry.timestamp > 5 * 60 * 1000) {
      cacheRegistry.delete(key);
      return null;
    }
    return entry.data;
  },
  set: <T>(key: string, data: T) => {
    cacheRegistry.set(key, { data, timestamp: Date.now() });
  },
  clear: () => cacheRegistry.clear(),
  remove: (keyPattern: string) => {
    for (const key of cacheRegistry.keys()) {
      if (key.includes(keyPattern)) {
        cacheRegistry.delete(key);
      }
    }
  }
};
