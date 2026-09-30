import React, { createContext, useContext, useMemo, useState } from "react";

import type { CatalogProduct } from "../types/catalog";

type CompareResult = { ok: true } | { ok: false; message: string };
type CompareContextValue = {
  products: CatalogProduct[];
  hasProduct: (productId: string) => boolean;
  addProduct: (product: CatalogProduct) => CompareResult;
  removeProduct: (productId: string) => void;
  clear: () => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);

  const value = useMemo<CompareContextValue>(() => ({
    products,
    hasProduct: (productId) => products.some((item) => item.id === productId),
    addProduct: (product) => {
      if (products.some((item) => item.id === product.id)) return { ok: true };
      if (products.length >= 4) {
        return { ok: false, message: "Chỉ có thể so sánh tối đa 4 sản phẩm." };
      }
      if (products.length && products[0].categoryId !== product.categoryId) {
        return {
          ok: false,
          message: `Hãy chọn sản phẩm cùng danh mục ${products[0].category}.`,
        };
      }
      setProducts((current) => [...current, product]);
      return { ok: true };
    },
    removeProduct: (productId) =>
      setProducts((current) => current.filter((item) => item.id !== productId)),
    clear: () => setProducts([]),
  }), [products]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) throw new Error("useCompare phải được dùng trong CompareProvider");
  return context;
}

