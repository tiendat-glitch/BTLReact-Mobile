import { apiDelete, apiGet, apiPost, apiPut } from "./httpClient";

const parseConfiguration = (item) =>
  typeof item.configuration_json === "string"
    ? JSON.parse(item.configuration_json)
    : item.configuration_json || null;

const adaptCartItem = (item) => {
  const configuration = parseConfiguration(item);
  const upgradeLabels = [configuration?.ram?.label, configuration?.ssd?.label]
    .filter(Boolean);
  return {
  id: String(item.product_id),
  cartItemId: String(item.id),
  cartKey: `${item.product_variant_id}:${item.configuration_key || ""}`,
  variantId: String(item.product_variant_id),
  name: item.product_name,
  variantName: [item.variant_name, ...upgradeLabels].filter(Boolean).join(" · "),
  sku: item.sku,
  price: Number(item.price),
  oldPrice: Number(item.compare_at_price || item.price),
  quantity: Number(item.quantity),
  stockQuantity: Number(item.stock_quantity),
  warrantyMonths: Number(item.warranty_months || 12),
  imageUrl: item.thumbnail_url || null,
  emoji: "⌨️",
  isAvailable:
    item.product_status === "ACTIVE" && item.variant_status === "ACTIVE",
  itemType: item.item_type || "PRODUCT",
  configuration,
  serverConfiguration:
    item.item_type === "LAPTOP_UPGRADE"
      ? {
          item_type: "LAPTOP_UPGRADE",
          upgrade: {
            ramOptionId: configuration?.ram?.id,
            ssdOptionId: configuration?.ssd?.id,
          },
        }
      : null,
  };
};

const adaptCart = (payload) => (payload?.data?.items || []).map(adaptCartItem);

export async function getServerCart() {
  return adaptCart(await apiGet("/cart"));
}

export async function addServerCartItem(variantId, quantity, configured = null) {
  return adaptCart(
    await apiPost("/cart/items", {
      product_variant_id: Number(variantId),
      quantity,
      ...(configured || {}),
    })
  );
}

export async function updateServerCartItem(itemId, quantity) {
  return adaptCart(await apiPut(`/cart/items/${itemId}`, { quantity }));
}

export async function removeServerCartItem(itemId) {
  await apiDelete(`/cart/items/${itemId}`);
}

export async function clearServerCart() {
  await apiDelete("/cart");
}

export default {
  getServerCart,
  addServerCartItem,
  updateServerCartItem,
  removeServerCartItem,
  clearServerCart,
};
