import { useCallback, useEffect, useRef, useState } from "react";

import { getCatalog, type Catalog } from "../services/catalogService";

const EMPTY_CATALOG: Catalog = { products: [], categories: [] };

export type UseCatalogResult = Catalog & {
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  retry: () => Promise<void>;
  refresh: () => Promise<void>;
};

export default function useCatalog(): UseCatalogResult {
  const requestId = useRef(0);
  const [catalog, setCatalog] = useState<Catalog>(EMPTY_CATALOG);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
        setError(nextError as Error);
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
