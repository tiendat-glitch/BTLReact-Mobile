import { useCallback, useEffect, useRef, useState } from "react";

import {
  getCatalogPage,
  type CatalogPagination,
} from "../services/catalogApiService";
import type { CatalogProduct } from "../types/catalog";

const EMPTY_PAGINATION: CatalogPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
};

export default function usePaginatedCatalog(query: string, category: string) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async (page: number, replace: boolean) => {
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    if (replace) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);
    try {
      const result = await getCatalogPage({
        page,
        query: query.trim(),
        category: category === "all" ? "" : category,
      });
      if (requestId.current !== currentRequest) return;
      setProducts((current) => replace ? result.items : [...current, ...result.items]);
      setPagination(result.pagination);
    } catch (nextError) {
      if (requestId.current === currentRequest) {
        setError(nextError instanceof Error ? nextError : new Error("Không tải được catalog."));
      }
    } finally {
      if (requestId.current === currentRequest) {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    }
  }, [query, category]);

  useEffect(() => {
    const timeout = setTimeout(() => { void load(1, true); }, 350);
    return () => {
      clearTimeout(timeout);
      requestId.current += 1;
    };
  }, [load]);

  const loadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && pagination.hasNextPage) {
      void load(pagination.page + 1, false);
    }
  }, [isLoading, isLoadingMore, pagination, load]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    void load(1, true);
  }, [load]);

  return {
    products,
    pagination,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    retry: () => load(1, true),
    loadMore,
    refresh,
  };
}
