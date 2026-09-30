import { adaptCatalogRows, adaptCategories } from "../data/catalogAdapter";
import { apiGet } from "./httpClient";

const getData = (payload) => (Array.isArray(payload?.data) ? payload.data : []);

export async function getCatalog() {
  const [productPayload, categoryPayload] = await Promise.all([
    apiGet("/catalog/products?limit=8&sort=popular&inStock=true"),
    apiGet("/categories"),
  ]);

  return {
    products: adaptCatalogRows(productPayload?.data?.items || []),
    categories: adaptCategories(getData(categoryPayload)),
  };
}

export default { getCatalog };

