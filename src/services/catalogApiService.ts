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

// Unwrap nhiều lớp `data` cho phản hồi backend không đồng nhất.
// Trả về payload đã bóc vỏ ngoài cùng và pagination tìm được ở bất kỳ
// cấp nào trong cây.
function unwrapPayload(input: unknown): {
  body: unknown;
  pagination?: CatalogPagination;
} {
  let cursor: unknown = input;
  let pagination: CatalogPagination | undefined;
  for (let depth = 0; depth < 4 && cursor && typeof cursor === "object"; depth += 1) {
    const node = cursor as {
      pagination?: CatalogPagination;
      data?: unknown;
    };
    if (!pagination && node.pagination && typeof node.pagination === "object") {
      pagination = node.pagination;
    }
    if (node.data && typeof node.data === "object") {
      cursor = node.data;
      continue;
    }
    break;
  }
  return { body: cursor, pagination };
}

export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  const { data } = await apiGet<unknown>("/categories");
  const { body } = unwrapPayload(data);
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
  const search = [
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
  const { data } = await apiGet<unknown>(`/catalog/products?${search}`);

  const { body, pagination: foundPagination } = unwrapPayload(data);
  let items: unknown[] = [];
  if (Array.isArray(body)) {
    items = body;
  } else if (body && typeof body === "object") {
    const obj = body as { items?: unknown[]; data?: unknown };
    if (Array.isArray(obj.items)) {
      items = obj.items;
    } else if (Array.isArray(obj.data as unknown)) {
      items = obj.data as unknown[];
    }
  }
  items = items.filter((entry) => entry && typeof entry === "object");

  const pagination: CatalogPagination = foundPagination ?? {
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
  filter?: SpecFilter;
}): Promise<CatalogFacets | null> {
  const search = [
    params.category ? `category=${encodeURIComponent(params.category)}` : "",
    params.query ? `q=${encodeURIComponent(params.query)}` : "",
    buildFilterParams(params.filter),
  ]
    .filter(Boolean)
    .join("&");
  const { data } = await apiGet<unknown>(
    `/catalog/facets${search ? `?${search}` : ""}`,
  );
  const { body } = unwrapPayload(data);
  if (body && typeof body === "object") {
    return body as CatalogFacets;
  }
  return null;
}