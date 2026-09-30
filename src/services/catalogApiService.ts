import { adaptCatalogRows, adaptCategories } from "../data/catalogAdapter";
import type { CatalogCategory, CatalogProduct } from "../types/catalog";
import { apiGet } from "./httpClient";

export type CatalogPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};

export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  const payload = await apiGet("/categories");
  return adaptCategories(Array.isArray(payload.data) ? payload.data : []);
}

export async function getCatalogPage(params: {
  page: number;
  limit?: number;
  query?: string;
  category?: string;
  sort?: string;
}): Promise<{ items: CatalogProduct[]; pagination: CatalogPagination }> {
  const query = [
    `page=${params.page}`,
    `limit=${params.limit || 20}`,
    `sort=${encodeURIComponent(params.sort || "newest")}`,
    "inStock=true",
    params.query ? `q=${encodeURIComponent(params.query)}` : "",
    params.category ? `category=${encodeURIComponent(params.category)}` : "",
  ].filter(Boolean).join("&");
  const payload = await apiGet(`/catalog/products?${query}`);
  return {
    items: adaptCatalogRows(payload.data.items),
    pagination: payload.data.pagination,
  };
}
