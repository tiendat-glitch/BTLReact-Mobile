import type { CatalogCategory, CatalogProduct } from "../types/catalog";
import { resolveImageUrl } from "../utils/imageUrl";

const CATEGORY_ICONS: Record<string, string> = {
  laptop: "💻",
  "pc-gaming": "🖥️",
  "pc-van-phong": "🖥️",
  "dien-thoai": "📱",
  "linh-kien": "🔧",
  "man-hinh": "🖥️",
  "phu-kien": "🎧",
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter(
      (entry): entry is string => typeof entry === "string" && entry.length > 0,
    );
  }
  if (typeof value === "string" && value.length > 0) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (entry): entry is string => typeof entry === "string" && entry.length > 0,
        );
      }
    } catch {
      // ignore
    }
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }
  return [];
};

const collectImages = (row: Record<string, unknown>): string[] => {
  const list: string[] = [];
  const append = (entries: string[]) => {
    entries.forEach((entry) => {
      const imageUrl = resolveImageUrl(entry);
      if (imageUrl && !list.includes(imageUrl)) list.push(imageUrl);
    });
  };
  append(toStringArray(row.product_images));
  if (typeof row.thumbnail_url === "string") {
    append([row.thumbnail_url]);
  }
  append(toStringArray(row.images));
  append(toStringArray(row.gallery));
  return list;
};

const getCategoryIcon = (category: { slug?: string } | null | undefined): string =>
  CATEGORY_ICONS[category?.slug || ""] || "⌁";

const getVariantSpecs = (variant: Record<string, unknown>): string[] =>
  [
    variant.cpu,
    variant.ram,
    variant.storage,
    variant.gpu,
    variant.screen_size,
    variant.screen_resolution,
    variant.refresh_rate,
    variant.operating_system,
    variant.color,
  ]
    .filter((entry): entry is string => typeof entry === "string" && entry.length > 0);

type RawCategory = {
  id: number | string;
  name: string;
  slug: string;
  status?: string;
};

export function adaptCategories(
  categories: unknown[] = [],
): CatalogCategory[] {
  const activeCategories = (categories as RawCategory[]).filter(
    (category) => category.status === "ACTIVE",
  );
  return [
    { id: "all", name: "Tất cả", emoji: "✨", slug: "all" },
    ...activeCategories.map<CatalogCategory>((category) => ({
      id: String(category.id),
      name: category.name,
      emoji: getCategoryIcon({ slug: category.slug }),
      slug: category.slug,
    })),
  ];
}

type RawCatalogRow = Record<string, unknown> & {
  id?: number | string;
  variant_id?: number | string;
  name?: string;
};

export function adaptCatalogRows(rows: unknown[] = []): CatalogProduct[] {
  return (rows as RawCatalogRow[]).map((row) => {
    const price = toNumber(row.price);
    const compareAtPrice = toNumber(row.compare_at_price, price);
    const stockQuantity = toNumber(row.stock_quantity);
    const images = collectImages(row);
    return {
      id: String(row.id ?? ""),
      variantId: String(row.variant_id ?? ""),
      name: typeof row.name === "string" ? row.name : "",
      category: typeof row.category_name === "string" ? row.category_name : "",
      categoryId: String(row.category_id ?? ""),
      brand: typeof row.brand_name === "string" ? row.brand_name : "",
      price,
      oldPrice: compareAtPrice >= price ? compareAtPrice : price,
      rating: toNumber(row.rating_average) || null,
      sold: toNumber(row.sold_quantity) || null,
      stockQuantity,
      deliveryTime:
        stockQuantity > 0 ? `Còn ${stockQuantity} sản phẩm` : "Tạm hết hàng",
      emoji: getCategoryIcon({ slug: row.category_slug as string | undefined }),
      imageUrl: images[0] || null,
      images,
      sku: typeof row.sku === "string" ? row.sku : "",
      variantName: typeof row.variant_name === "string" ? row.variant_name : "",
      description:
        typeof row.description === "string"
          ? row.description
          : "Chưa có mô tả sản phẩm.",
      specs: getVariantSpecs(row),
      warrantyMonths: toNumber(row.warranty_months, 12),
      voucherPrice:
        row.voucher_discounted_price == null
          ? undefined
          : toNumber(row.voucher_discounted_price),
      voucherCode:
        typeof row.voucher_code === "string" ? row.voucher_code : undefined,
      voucherMinOrder:
        row.voucher_min_order_value == null
          ? undefined
          : toNumber(row.voucher_min_order_value),
    };
  });
}

type AdaptInput = {
  products?: Array<Record<string, unknown>>;
  categories?: unknown[];
  variants?: Array<Record<string, unknown>>;
};

export function adaptCatalog(input: AdaptInput = {}): {
  products: CatalogProduct[];
  categories: CatalogCategory[];
} {
  const { products = [], categories = [], variants = [] } = input;
  const typedCategories = categories as RawCategory[];
  const activeCategories = typedCategories.filter(
    (category) => category.status === "ACTIVE",
  );
  const categoriesById = new Map(
    activeCategories.map((category) => [String(category.id), category]),
  );
  const variantsByProductId = variants.reduce<Map<string, Array<Record<string, unknown>>>>(
    (result, variant) => {
      if (variant.status !== "ACTIVE") return result;
      const productId = String(variant.product_id);
      const current = result.get(productId) || [];
      current.push(variant);
      result.set(productId, current);
      return result;
    },
    new Map(),
  );

  const adaptedProducts = products
    .filter((product) => product.status === "ACTIVE")
    .map((product) => {
      const productVariants =
        variantsByProductId.get(String(product.id)) || [];
      const variant =
        (productVariants.find(
          (item) => toNumber(item.stock_quantity) > 0,
        ) as Record<string, unknown> | undefined) ||
        (productVariants[0] as Record<string, unknown> | undefined);
      const category = categoriesById.get(String(product.category_id));
      if (!variant || !category) return null as CatalogProduct | null;
      const price = toNumber(variant.price);
      const compareAtPrice = toNumber(variant.compare_at_price, price);
      const stockQuantity = toNumber(variant.stock_quantity);
      const images = collectImages(product);
      const item: CatalogProduct = {
        id: String(product.id),
        variantId: String(variant.id),
        name: String(product.name || ""),
        category: category.name,
        categoryId: String(category.id),
        brand: typeof product.brand_name === "string" ? product.brand_name : "",
        price,
        oldPrice: compareAtPrice >= price ? compareAtPrice : price,
        rating: null,
        sold: null,
        stockQuantity,
        deliveryTime:
          stockQuantity > 0 ? `Còn ${stockQuantity} sản phẩm` : "Tạm hết hàng",
        emoji: getCategoryIcon(category),
        imageUrl: images[0] || null,
        images,
        sku: typeof variant.sku === "string" ? variant.sku : "",
        variantName:
          typeof variant.variant_name === "string" ? variant.variant_name : "",
        description:
          typeof product.description === "string"
            ? product.description
            : "Chưa có mô tả sản phẩm.",
        specs: getVariantSpecs(variant),
        warrantyMonths: toNumber(variant.warranty_months, 12),
        voucherPrice: undefined,
        voucherCode: undefined,
        voucherMinOrder: undefined,
      };
      return item;
    })
    .filter((entry): entry is CatalogProduct => entry !== null);

  return {
    products: adaptedProducts,
    categories: adaptCategories(activeCategories),
  };
}

export default { adaptCatalog, adaptCatalogRows, adaptCategories };
