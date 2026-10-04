import { adaptCatalogRows, adaptCategories } from "../data/catalogAdapter";
import type { CatalogCategory, CatalogProduct } from "../types/catalog";
import type { CatalogFacets, SpecFilter } from "../types/specFilter";
import { apiGet } from "./httpClient";

export type CatalogPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};

export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  const { data } = await apiGet<unknown>("/categories");
  // `apiGet` đã unwrap 1 lần; `data` là body backend trả, ví dụ
  // `{ data: [...] }`. Một số phiên bản cũ trả thẳng mảng.
  let body = data;
  if (body && typeof body === "object" && "data" in body) {
    body = (body as { data: unknown }).data;
  }
  return adaptCategories(Array.isArray(body) ? body : []);
}

const buildFilterParams = (filter: SpecFilter | undefined): string => {
  if (!filter) return "";
  const parts: string[] = [];
  const appendList = (key: string, values?: string[]) => {
    if (values && values.length > 0) {
      parts.push(`${key}=${values.map(encodeURIComponent).join(",")}`);
    }
  };
  appendList("brand", filter.brand);
  appendList("cpu", filter.cpu);
  appendList("ram", filter.ram);
  appendList("storage", filter.storage);
  appendList("gpu", filter.gpu);
  appendList("screenSize", filter.screenSize);
  appendList("refreshRate", filter.refreshRate);
  if (filter.priceMin != null) parts.push(`priceMin=${filter.priceMin}`);
  if (filter.priceMax != null) parts.push(`priceMax=${filter.priceMax}`);
  return parts.join("&");
};

export async function getCatalogPage(params: {
  page: number;
  limit?: number;
  query?: string;
  category?: string;
  sort?: string;
  filter?: SpecFilter;
}): Promise<{ items: CatalogProduct[]; pagination: CatalogPagination }> {
  const query = [
    `page=${params.page}`,
    `limit=${params.limit || 20}`,
    `sort=${encodeURIComponent(params.sort || "newest")}`,
    "inStock=true",
    params.query ? `q=${encodeURIComponent(params.query)}` : "",
    params.category ? `category=${encodeURIComponent(params.category)}` : "",
    buildFilterParams(params.filter),
  ]
    .filter(Boolean)
    .join("&");
  const { data } = await apiGet<unknown>(
    `/catalog/products?${query}`,
  );

  // `apiGet` đã unwrap 1 lần; `data` là body backend trả. Catalog backend
  // trả `{ data: [...], pagination: {...} }`; các phiên bản cũ có thể trả
  // `{ items: [...], pagination: {...} }` hoặc thẳng mảng. Chuẩn hóa.
  const body = data;
  let items: unknown[] = [];
  if (body && typeof body === "object" && "data" in body) {
    items = (body as { data: unknown }).data as unknown[];
  }
  if (!Array.isArray(items) && body && typeof body === "object" && "items" in body) {
    items = (body as { items: unknown[] }).items;
  }
  if (!Array.isArray(items)) items = [];

  const pagination =
    body && typeof body === "object" && "pagination" in body
      ? ((body as { pagination: CatalogPagination }).pagination ?? {
          page: params.page,
          limit: params.limit || 20,
          total: items.length,
          totalPages: 1,
          hasNextPage: false,
        })
      : {
          page: params.page,
          limit: params.limit || 20,
          total: items.length,
          totalPages: 1,
          hasNextPage: false,
        };

  return {
    items: adaptCatalogRows(items),
    pagination,
  };
}

export async function getCatalogFacets(params: {
  category?: string;
  query?: string;
}): Promise<CatalogFacets> {
  const query = [
    params.category ? `category=${encodeURIComponent(params.category)}` : "",
    params.query ? `q=${encodeURIComponent(params.query)}` : "",
  ]
    .filter(Boolean)
    .join("&");
  const { data } = await apiGet<unknown>(
    `/catalog/facets${query ? `?${query}` : ""}`,
  );
  // `apiGet` đã unwrap 1 lần; `data` là body backend trả. Nếu backend
  // tiếp tục wrap `{ data: facets }` thì unwrap tiếp, ngược lại trả thẳng.
  if (data && typeof data === "object" && "data" in data) {
    return (data as { data: CatalogFacets }).data ?? null;
  }
  return (data as CatalogFacets) ?? null;
}