import { useState, useCallback, useRef } from 'react';

// ─── useApi Hook ─────────────────────────────────────────────
// Wraps async API calls with loading/error state management.
//
// Usage:
//   const { data, loading, error, execute } = useApi(incidentApi.list);
//   useEffect(() => { execute({ page: 1 }); }, []);
// ─────────────────────────────────────────────────────────────

export function useApi(apiFn, options = {}) {
  const { onSuccess, onError, initialData = null } = options;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFn(...args);
        if (mountedRef.current) {
          setData(result);
          onSuccess?.(result);
        }
        return result;
      } catch (err) {
        const normalized = {
          message: err.message || 'An error occurred',
          status: err.status || 0,
          isNetworkError: err.isNetworkError || false,
        };
        if (mountedRef.current) {
          setError(normalized);
          onError?.(normalized);
        }
        throw normalized;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [apiFn, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  return { data, loading, error, execute, reset };
}
