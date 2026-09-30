import { apiGet, apiPatch, apiPost } from "./httpClient";

export async function createOrder({ addressId, voucherCode, note }) {
  const payload = await apiPost("/orders", {
    addressId: Number(addressId),
    voucherCode: voucherCode?.trim() || undefined,
    note: note?.trim() || undefined,
  });
  return payload.data;
}

export async function getOrders() {
  const payload = await apiGet("/orders");
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function getOrder(id) {
  return (await apiGet(`/orders/${id}`)).data;
}

export async function cancelOrder(id, reason) {
  return (await apiPatch(`/orders/${id}/cancel`, { reason })).data;
}

export default { createOrder, getOrders, getOrder, cancelOrder };

