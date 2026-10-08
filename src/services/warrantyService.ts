import { apiGet } from "./httpClient";

export type Warranty = {
  id: number;
  order_item_id: number;
  product_variant_id: number | null;
  serial_number: string | null;
  start_date: string;
  end_date: string;
  status: "ACTIVE" | "EXPIRED" | "CLAIMED";
  note: string | null;
  created_at: string;
  product_name?: string;
  variant_name?: string;
  sku?: string;
  subtotal?: number;
  thumbnail_url?: string | null;
  product_display_name?: string | null;
  variant_sku?: string | null;
  order_code?: string;
  order_id?: number;
};

export type WarrantyStatus = "ACTIVE" | "EXPIRED" | "CLAIMED" | "ALL";

export const getWarranties = async (
  status?: WarrantyStatus,
): Promise<Warranty[]> => {
  const { data } = await apiGet<
    Warranty[] | { data?: Warranty[]; items?: Warranty[] }
  >("/warranties");
  const items = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.items)
        ? data.items
        : [];
  if (status && status !== "ALL") {
    return items.filter((w) => w.status === status);
  }
  return items;
};

export const getWarranty = async (id: number): Promise<Warranty> => {
  const { data } = await apiGet<Warranty>(`/warranties/${id}`);
  return data;
};

export const lookupWarranty = async (serial: string): Promise<Warranty> => {
  const { data } = await apiGet<Warranty>(
    `/warranties/serial/${encodeURIComponent(serial)}`,
  );
  return data;
};