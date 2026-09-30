const CATEGORY_ICONS = {
  laptop: "💻",
  "pc-gaming": "🖥️",
  "pc-van-phong": "🖥️",
  "dien-thoai": "📱",
  "linh-kien": "🔧",
  "man-hinh": "🖥️",
  "phu-kien": "🎧",
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getCategoryIcon = (category) =>
  CATEGORY_ICONS[category?.slug] || "⌁";

const getVariantSpecs = (variant) =>
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
  ].filter(Boolean);

export function adaptCategories(categories = []) {
  const activeCategories = categories.filter(
    (category) => category.status === "ACTIVE"
  );
  return [
    { id: "all", name: "Tất cả", emoji: "✨", slug: "all" },
    ...activeCategories.map((category) => ({
      id: String(category.id),
      name: category.name,
      emoji: getCategoryIcon(category),
      slug: category.slug,
    })),
  ];
}

export function adaptCatalogRows(rows = []) {
  return rows.map((row) => {
    const price = toNumber(row.price);
    const compareAtPrice = toNumber(row.compare_at_price, price);
    const stockQuantity = toNumber(row.stock_quantity);
    return {
      id: String(row.id),
      variantId: String(row.variant_id),
      name: row.name,
      category: row.category_name,
      categoryId: String(row.category_id),
      brand: row.brand_name || "",
      price,
      oldPrice: compareAtPrice >= price ? compareAtPrice : price,
      rating: toNumber(row.rating_average) || null,
      sold: toNumber(row.sold_quantity) || null,
      stockQuantity,
      deliveryTime:
        stockQuantity > 0 ? `Còn ${stockQuantity} sản phẩm` : "Tạm hết hàng",
      emoji: getCategoryIcon({ slug: row.category_slug }),
      imageUrl: row.thumbnail_url || null,
      sku: row.sku,
      variantName: row.variant_name,
      description: row.description || "Chưa có mô tả sản phẩm.",
      specs: getVariantSpecs(row),
      warrantyMonths: toNumber(row.warranty_months, 12),
    };
  });
}

export function adaptCatalog({ products = [], categories = [], variants = [] }) {
  const activeCategories = categories.filter(
    (category) => category.status === "ACTIVE"
  );
  const categoriesById = new Map(
    activeCategories.map((category) => [String(category.id), category])
  );
  const variantsByProductId = variants.reduce((result, variant) => {
    if (variant.status !== "ACTIVE") {
      return result;
    }

    const productId = String(variant.product_id);
    const current = result.get(productId) || [];
    current.push(variant);
    result.set(productId, current);
    return result;
  }, new Map());

  const adaptedProducts = products
    .filter((product) => product.status === "ACTIVE")
    .map((product) => {
      const productVariants = variantsByProductId.get(String(product.id)) || [];
      const variant =
        productVariants.find((item) => toNumber(item.stock_quantity) > 0) ||
        productVariants[0];
      const category = categoriesById.get(String(product.category_id));

      if (!variant || !category) {
        return null;
      }

      const price = toNumber(variant.price);
      const compareAtPrice = toNumber(variant.compare_at_price, price);
      const stockQuantity = toNumber(variant.stock_quantity);

      return {
        id: String(product.id),
        variantId: String(variant.id),
        name: product.name,
        category: category.name,
        categoryId: String(category.id),
        brand: product.brand_name || "",
        price,
        oldPrice: compareAtPrice >= price ? compareAtPrice : price,
        rating: null,
        sold: null,
        stockQuantity,
        deliveryTime:
          stockQuantity > 0 ? `Còn ${stockQuantity} sản phẩm` : "Tạm hết hàng",
        emoji: getCategoryIcon(category),
        imageUrl: product.thumbnail_url || null,
        sku: variant.sku,
        variantName: variant.variant_name,
        description: product.description || "Chưa có mô tả sản phẩm.",
        specs: getVariantSpecs(variant),
        warrantyMonths: toNumber(variant.warranty_months, 12),
      };
    })
    .filter(Boolean);

  return {
    products: adaptedProducts,
    categories: adaptCategories(activeCategories),
  };
}

export default { adaptCatalog, adaptCatalogRows, adaptCategories };
