import { adaptCatalogRows, adaptCategories } from "../data/catalogAdapter";
import { apiGet } from "./httpClient";
import type { CatalogCategory, CatalogProduct } from "../types/catalog";

export type Catalog = {
  products: CatalogProduct[];
  categories: CatalogCategory[];
};

const getData = <T,>(payload: { data?: T } | null | undefined): T | unknown[] => {
  const raw = (payload as { data?: unknown })?.data;
  return (raw as T) ?? [];
};

export async function getCatalog(): Promise<Catalog> {
  const [productPayload, categoryPayload] = await Promise.all([
    apiGet<unknown>("/catalog/products?limit=8&sort=popular&inStock=true"),
    apiGet<unknown>("/categories"),
  ]);

  // `apiGet` đã unwrap JSON một lần và trả về `{ data: T }`. Vì vậy
  // `payload.data` chính là body backend trả. Backend catalog trả
  // `{ data: [...], pagination: {...} }`, còn backend categories trả
  // `{ data: [...] }`. Một số phiên bản cũ trả thẳng mảng — chuẩn hóa.
  const unwrap = (raw: unknown): unknown[] => {
    let body = raw;
    if (body && typeof body === "object" && "data" in body) {
      body = (body as { data: unknown }).data;
    }
    if (body && typeof body === "object" && "items" in body) {
      body = (body as { items: unknown[] }).items;
    }
    if (Array.isArray(body)) return body;
    return [];
  };

  const productItems = unwrap(productPayload.data);
  const categoryItems = unwrap(categoryPayload.data);

  return {
    products: adaptCatalogRows(productItems),
    categories: adaptCategories(categoryItems),
  };
}

export default { getCatalog };
