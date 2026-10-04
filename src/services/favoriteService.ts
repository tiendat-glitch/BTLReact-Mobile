import type { CatalogProduct } from "../types/catalog";
import { apiDelete, apiGet, apiPost } from "./httpClient";

type FavoriteRow = {
  id: number | string;
  category_id: number | string;
  category_name: string;
  category_slug: string;
  brand_name: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  variant_id: number | string;
  sku: string;
  variant_name: string;
  price: number | string;
  compare_at_price: number | string | null;
  stock_quantity: number | string;
  cpu: string | null;
  ram: string | null;
  storage: string | null;
  gpu: string | null;
  screen_size: string | null;
  screen_resolution: string | null;
  refresh_rate: string | null;
  operating_system: string | null;
  color: string | null;
  warranty_months: number | string;
};

const categoryIcons: Record<string, string> = {
  laptop: "💻",
  "pc-gaming": "🖥️",
  "pc-van-phong": "🖥️",
  "dien-thoai": "📱",
  "linh-kien": "🔧",
  "man-hinh": "🖥️",
  "phu-kien": "🎧",
};

const adaptFavorite = (row: FavoriteRow): CatalogProduct => {
  const price = Number(row.price);
  const oldPrice = Number(row.compare_at_price || price);
  const stockQuantity = Number(row.stock_quantity);
  return {
    id: String(row.id),
    variantId: String(row.variant_id),
    name: row.name,
    category: row.category_name,
    categoryId: String(row.category_id),
    brand: row.brand_name,
    price,
    oldPrice: oldPrice >= price ? oldPrice : price,
    rating: null,
    sold: null,
    stockQuantity,
    deliveryTime:
      stockQuantity > 0 ? `Còn ${stockQuantity} sản phẩm` : "Tạm hết hàng",
    emoji: categoryIcons[row.category_slug] || "⌁",
    imageUrl: row.thumbnail_url,
    images: row.thumbnail_url ? [row.thumbnail_url] : [],
    sku: row.sku,
    variantName: row.variant_name,
    description: row.description || "Chưa có mô tả sản phẩm.",
    specs: [
      row.cpu,
      row.ram,
      row.storage,
      row.gpu,
      row.screen_size,
      row.screen_resolution,
      row.refresh_rate,
      row.operating_system,
      row.color,
    ].filter((value): value is string => Boolean(value)),
    warrantyMonths: Number(row.warranty_months || 12),
  };
};

export async function getFavorites(): Promise<CatalogProduct[]> {
  const { data } = await apiGet<
    FavoriteRow[] | { data?: FavoriteRow[]; items?: FavoriteRow[] }
  >("/favorites");
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.items)
        ? data.items
        : [];
  return rows.map(adaptFavorite);
}

export async function getFavoriteStatus(productId: string) {
  const favorites = await getFavorites();
  return favorites.some((product) => product.id === String(productId));
}

export async function addFavorite(productId: string) {
  await apiPost(`/favorites/${productId}`, {});
}

export async function removeFavorite(productId: string) {
  await apiDelete(`/favorites/${productId}`);
}
