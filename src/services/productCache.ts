// Simple in-memory cache for product objects to avoid passing them through navigation
// params (and polluting URL state). Cleared on app restart.
const cache = new Map();

export function cacheProduct(product: { id: unknown } | null | undefined) {
  if (!product || product.id == null) return;
  cache.set(String(product.id), product);
}

export function getCachedProduct(productId: unknown) {
  if (productId == null) return null;
  return cache.get(String(productId)) || null;
}

export default { cacheProduct, getCachedProduct };