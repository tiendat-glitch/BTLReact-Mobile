import { useCallback } from "react";
import { Alert } from "react-native";

import { useCompare } from "../context/CompareContext";
import type { CatalogProduct } from "../types/catalog";

/**
 * Hook tích hợp CompareContext với UI feedback (Alert) để dùng cho ProductCard,
 * ProductDetail và Compare floating button.
 *
 * - Trả về handler `handleCompare(product)` an toàn để gọi từ bất kỳ đâu
 * - Nếu sản phẩm đã có trong compare → xóa
 * - Nếu chưa có → thêm (có validate cùng category, max 4)
 */
export default function useCompareAction() {
  const compare = useCompare();

  const toggle = useCallback(
    (product: CatalogProduct) => {
      if (compare.hasProduct(product.id)) {
        compare.removeProduct(product.id);
        return { ok: true, action: "removed" as const };
      }
      const result = compare.addProduct(product);
      if (!result.ok) {
        Alert.alert("Không thể thêm so sánh", result.message);
        return { ok: false, action: "rejected" as const };
      }
      return { ok: true, action: "added" as const };
    },
    [compare],
  );

  return {
    products: compare.products,
    count: compare.products.length,
    hasProduct: compare.hasProduct,
    toggle,
    remove: compare.removeProduct,
    clear: compare.clear,
  };
}