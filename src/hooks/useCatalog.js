import { useCallback, useEffect, useRef, useState } from "react";

import { getCatalog } from "../services/catalogService";

const EMPTY_CATALOG = { products: [], categories: [] };

export default function useCatalog() {
  const requestId = useRef(0);
  const [catalog, setCatalog] = useState(EMPTY_CATALOG);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadCatalog = useCallback(async ({ refresh = false } = {}) => {
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const nextCatalog = await getCatalog();
      if (requestId.current === currentRequestId) {
        setCatalog(nextCatalog);
      }
    } catch (nextError) {
      if (requestId.current === currentRequestId) {
        setError(nextError);
      }
    } finally {
      if (requestId.current === currentRequestId) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadCatalog();
    return () => {
      requestId.current += 1;
    };
  }, [loadCatalog]);

  return {
    ...catalog,
    isLoading,
    isRefreshing,
    error,
    retry: loadCatalog,
    refresh: () => loadCatalog({ refresh: true }),
  };
}

