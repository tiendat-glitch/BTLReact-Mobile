import { apiDelete, apiGet, apiPatch, apiPost } from "./httpClient";

type RawConfiguration = {
  ram?: { id?: number | string; label?: string } | null;
  ssd?: { id?: number | string; label?: string } | null;
};

type RawCartItem = {
  id: number | string;
  product_id?: number | string;
  product_variant_id: number | string;
  product?: {
    id?: number | string;
    name?: string;
    thumbnail_url?: string | null;
    status?: string;
  };
  product_name?: string;
  variant_name: string | null;
  sku: string;
  price: string | number;
  price_adjustment?: string | number;
  compare_at_price?: string | number | null;
  quantity: number | string;
  stock_quantity: number | string;
  warranty_months?: number | string;
  thumbnail_url?: string | null;
  product_status: string;
  variant_status: string;
  item_type?: "PRODUCT" | "LAPTOP_UPGRADE";
  configuration_key?: string;
  configuration_json?: string | RawConfiguration | null;
};

type CartListResponse =
  | { items: RawCartItem[] }
  | { data: { items: RawCartItem[] } };

const parseConfiguration = (
  item: RawCartItem,
): RawConfiguration | null => {
  const raw = item.configuration_json;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as RawConfiguration;
    } catch {
      return null;
    }
  }
  return raw ?? null;
};

export type CartServerConfiguration = {
  item_type: "LAPTOP_UPGRADE";
  upgrade: {
    ramOptionId?: number | string | null;
    ssdOptionId?: number | string | null;
  };
};

export type CartItem = {
  id: string;
  cartItemId: string;
  cartKey: string;
  variantId: string;
  name: string;
  variantName: string;
  sku: string;
  price: number;
  oldPrice: number;
  quantity: number;
  stockQuantity: number;
  warrantyMonths: number;
  imageUrl: string | null;
  emoji: string;
  isAvailable: boolean;
  itemType: "PRODUCT" | "LAPTOP_UPGRADE";
  configuration: RawConfiguration | null;
  serverConfiguration: CartServerConfiguration | null;
};

const adaptCartItem = (item: RawCartItem): CartItem => {
  const configuration = parseConfiguration(item);
  const upgradeLabels = [configuration?.ram?.label, configuration?.ssd?.label]
    .filter((entry): entry is string => Boolean(entry));
  const price = Number(item.price) + Number(item.price_adjustment || 0);
  return {
    id: String(item.product_id ?? item.product?.id ?? ""),
    cartItemId: String(item.id),
    cartKey: `${item.product_variant_id}:${item.configuration_key || ""}`,
    variantId: String(item.product_variant_id),
    name: item.product_name ?? item.product?.name ?? "",
    variantName: [item.variant_name, ...upgradeLabels]
      .filter(Boolean)
      .join(" · "),
    sku: item.sku,
    price,
    oldPrice: Number(item.compare_at_price ?? item.price) + Number(item.price_adjustment || 0),
    quantity: Number(item.quantity),
    stockQuantity: Number(item.stock_quantity),
    warrantyMonths: Number(item.warranty_months || 12),
    imageUrl: item.thumbnail_url || item.product?.thumbnail_url || null,
    emoji: "⌨️",
    isAvailable:
      (item.product_status ?? item.product?.status) === "ACTIVE" &&
      item.variant_status === "ACTIVE",
    itemType: item.item_type || "PRODUCT",
    configuration,
    serverConfiguration:
      item.item_type === "LAPTOP_UPGRADE"
        ? {
            item_type: "LAPTOP_UPGRADE",
            upgrade: {
              ramOptionId: configuration?.ram?.id ?? null,
              ssdOptionId: configuration?.ssd?.id ?? null,
            },
          }
        : null,
  };
};

const adaptCart = (payload: unknown): CartItem[] => {
  let body =
    payload && typeof payload === "object"
      ? (payload as { data?: unknown }).data
      : null;
  if (body && typeof body === "object" && "data" in body) {
    body = (body as { data: unknown }).data;
  }
  const items = Array.isArray(body)
    ? body
    : body && typeof body === "object" && "items" in body
      ? (body as { items?: unknown }).items
      : null;
  if (!Array.isArray(items)) {
    throw new Error("Dữ liệu giỏ hàng trả về không hợp lệ.");
  }
  return items.map(adaptCartItem);
};

export type AddCartItemInput = {
  product_variant_id: number;
  quantity: number;
  item_type?: "PRODUCT" | "LAPTOP_UPGRADE";
  configuration_key?: string;
  configuration_json?: RawConfiguration | null;
};

export async function getServerCart(): Promise<CartItem[]> {
  const payload = await apiGet<CartListResponse>("/cart");
  return adaptCart(payload);
}

export async function addServerCartItem(
  variantId: number | string,
  quantity: number,
  configured: AddCartItemInput | null = null,
): Promise<CartItem[]> {
  await apiPost<unknown>("/cart/items", {
    productVariantId: Number(variantId),
    quantity,
    ...(configured || {}),
  });
  return getServerCart();
}

export async function updateServerCartItem(
  itemId: number | string,
  quantity: number,
): Promise<CartItem[]> {
  await apiPatch<unknown>(`/cart/items/${itemId}`, {
    quantity,
  });
  return getServerCart();
}

export async function removeServerCartItem(
  itemId: number | string,
): Promise<void> {
  await apiDelete(`/cart/items/${itemId}`);
}

export async function clearServerCart(): Promise<void> {
  await apiDelete("/cart");
}

export default {
  getServerCart,
  addServerCartItem,
  updateServerCartItem,
  removeServerCartItem,
  clearServerCart,
};
