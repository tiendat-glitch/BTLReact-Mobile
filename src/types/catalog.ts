export type CatalogCategory = {
  id: string;
  name: string;
  emoji: string;
  slug: string;
};

export type CatalogProduct = {
  id: string;
  variantId: string;
  name: string;
  category: string;
  categoryId: string;
  brand: string;
  price: number;
  oldPrice: number;
  rating: number | null;
  sold: number | null;
  stockQuantity: number;
  deliveryTime: string;
  emoji: string;
  imageUrl: string | null;
  images: string[];
  sku: string;
  variantName: string;
  description: string;
  specs: string[];
  warrantyMonths: number;
  voucherPrice?: number;
  voucherCode?: string;
  voucherMinOrder?: number;
};
