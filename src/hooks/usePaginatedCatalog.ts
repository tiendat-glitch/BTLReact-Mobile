import { useCallback, useEffect, useRef, useState } from "react";

import {
  getCatalogPage,
  getCatalogFacets,
  type CatalogPagination,
} from "../services/catalogApiService";
import type { CatalogProduct } from "../types/catalog";
import type { CatalogFacets, SpecFilter } from "../types/specFilter";

const EMPTY_PAGINATION: CatalogPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
};

export default function usePaginatedCatalog(
  query: string,
  category: string,
  filter: SpecFilter
) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [facets, setFacets] = useState<CatalogFacets | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const requestId = useRef(0);

  const load = useCallback(
    async (page: number, replace: boolean) => {
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
          filter,
        });
        if (requestId.current !== currentRequest) return;
        setProducts((current) =>
          replace ? result.items : [...current, ...result.items]
        );
        setPagination(result.pagination);
      } catch (nextError) {
        if (requestId.current === currentRequest) {
          setError(
            nextError instanceof Error
              ? nextError
              : new Error("Không tải được catalog.")
          );
        }
      } finally {
        if (requestId.current === currentRequest) {
          setIsLoading(false);
          setIsLoadingMore(false);
          setIsRefreshing(false);
        }
      }
    },
    [query, category, filter]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      void load(1, true);
    }, 350);
    return () => {
      clearTimeout(timeout);
      requestId.current += 1;
    };
  }, [load]);

  const loadFacets = useCallback(async () => {
    try {
      const next = await getCatalogFacets({
        category: category === "all" ? "" : category,
        query: query.trim(),
      });
      setFacets(next);
    } catch {
      // Silent — facet sheet will show empty groups.
      setFacets(null);
    }
  }, [category, query]);

  useEffect(() => {
    void loadFacets();
  }, [loadFacets]);

  const loadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && pagination.hasNextPage) {
      void load(pagination.page + 1, false);
    }
  }, [isLoading, isLoadingMore, pagination, load]);

  const goToPage = useCallback(
    (page: number) => {
      const target = Math.max(1, Math.min(pagination.totalPages || 1, page));
      if (target === pagination.page) return;
      if (isLoading || isLoadingMore) return;
      void load(target, true);
    },
    [pagination.page, pagination.totalPages, isLoading, isLoadingMore, load],
  );

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    void load(1, true);
    void loadFacets();
  }, [load, loadFacets]);

  return {
    products,
    pagination,
    facets,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    retry: () => load(1, true),
    loadMore,
    goToPage,
    refresh,
  };
}
