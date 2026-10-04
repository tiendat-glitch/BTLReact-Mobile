import { apiGet, apiPatch, apiPost } from "./httpClient";

type OrderList =
  | unknown[]
  | { items?: unknown[]; data?: unknown[] | { items?: unknown[] } };

const unwrapList = (payload: { data: OrderList }): unknown[] => {
  const raw = payload.data;
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.items)) return raw.items;
  if (raw && Array.isArray((raw as { data?: unknown[] }).data)) {
    return (raw as { data: unknown[] }).data;
  }
  const nested = raw && typeof raw.data === "object" ? raw.data : null;
  if (nested && "items" in nested && Array.isArray(nested.items)) {
    return nested.items;
  }
  return [];
};

const unwrapOne = <T,>(payload: { data: T }): T => {
  const raw = payload.data;
  if (raw && typeof raw === "object" && "data" in raw) {
    return raw.data as T;
  }
  return raw;
};

const normalizeOrder = (value: unknown): unknown => {
  if (!value || typeof value !== "object") return value;
  const order = value as Record<string, unknown>;
  return {
    ...order,
    order_code: order.order_code ?? order.code,
    payment_status:
      order.payment_status ??
      (order.payment as Record<string, unknown> | undefined)?.status,
    payment_method:
      order.payment_method ??
      (order.payment as Record<string, unknown> | undefined)?.method,
    delivery_receiver_name:
      order.delivery_receiver_name ??
      (order.address as Record<string, unknown> | undefined)?.receiver_name,
    delivery_phone:
      order.delivery_phone ??
      (order.address as Record<string, unknown> | undefined)?.receiver_phone,
    delivery_address:
      order.delivery_address ??
      (order.address as Record<string, unknown> | undefined)?.address,
  };
};

export type CreateOrderInput = {
  addressId: number | string;
  voucherCode?: string;
  note?: string;
};

export type CancelOrderInput = {
  reason: string;
};

export async function createOrder(
  input: CreateOrderInput,
): Promise<unknown> {
  const payload = await apiPost<{ data: unknown }>("/orders", {
    addressId: Number(input.addressId),
    voucherCode: input.voucherCode?.trim() || undefined,
    note: input.note?.trim() || undefined,
  });
  return unwrapOne(payload);
}

export async function getOrders(): Promise<unknown[]> {
  const payload = await apiGet<OrderList>("/orders");
  return unwrapList(payload).map(normalizeOrder);
}

export async function getOrder(id: number | string): Promise<unknown> {
  const payload = await apiGet<{ data: unknown }>(`/orders/${id}`);
  return normalizeOrder(unwrapOne(payload));
}

export async function cancelOrder(
  id: number | string,
  reason: string,
): Promise<unknown> {
  const payload = await apiPost<{ data: unknown }>(`/orders/${id}/cancel`, {
    reason,
  });
  return unwrapOne(payload);
}

export default { createOrder, getOrders, getOrder, cancelOrder };
