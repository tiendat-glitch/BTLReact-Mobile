import products from "./productData";
import categories from "./categoryData";

// Keeps the UI independent from the future catalog API response shape.
export function getCatalogSnapshot() {
  return {
    products,
    categories,
  };
}

export default {
  getCatalogSnapshot,
};
