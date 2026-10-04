import { apiDelete, apiGet, apiPatch, apiPost } from "./httpClient";

export type PriceAlertType = "PRICE_DROP" | "BACK_IN_STOCK";

export type PriceAlert = {
  id: number;
  user_id: number;
  product_id: number;
  product_variant_id: number | null;
  alert_type: PriceAlertType;
  target_price: number | null;
  current_price_at_create: number | null;
  is_active: boolean | number;
  triggered_at: string | null;
  last_notified_at: string | null;
  created_at: string;
  updated_at: string;
  // joined fields
  product_name?: string;
  thumbnail_url?: string | null;
  current_price?: number;
  stock_quantity?: number;
};

export const getPriceAlerts = async (): Promise<PriceAlert[]> => {
  const { data } = await apiGet<
    PriceAlert[] | { data?: PriceAlert[]; items?: PriceAlert[] }
  >("/price-alerts");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const createPriceAlert = async (input: {
  productId: number;
  productVariantId?: number;
  alertType?: PriceAlertType;
  targetPrice?: number;
}): Promise<{ id: number }> => {
  const { data } = await apiPost<{ id: number }>("/price-alerts", input);
  return data;
};

export const updatePriceAlert = async (
  id: number,
  patch: { isActive?: boolean; targetPrice?: number | null },
): Promise<void> => {
  await apiPatch(`/price-alerts/${id}`, patch);
};

export const deletePriceAlert = async (id: number): Promise<void> => {
  await apiDelete(`/price-alerts/${id}`);
};