import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "./httpClient";
import type { Address, AddressInput } from "../types/address";

type AddressListResponse = Address[] | { data: Address[] };

const unwrapList = (payload: { data: AddressListResponse }): Address[] => {
  const raw = payload.data;
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray((raw as { data?: Address[] }).data)) {
    return (raw as { data: Address[] }).data;
  }
  return [];
};

export async function getAddresses(): Promise<Address[]> {
  const payload = await apiGet<AddressListResponse>("/addresses");
  return unwrapList(payload);
}

export async function createAddress(data: AddressInput): Promise<Address> {
  const payload = await apiPost<{ data: Address } | Address>("/addresses", data);
  // httpClient trả { data: T }, nên payload.data là BE body.
  // BE body có thể là Address thẳng hoặc { data: Address } tuỳ shape.
  const body = payload.data as Address | { data: Address };
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: Address }).data;
  }
  return body as Address;
}

export async function updateAddress(
  id: number | string,
  data: Partial<AddressInput>,
): Promise<Address> {
  const payload = await apiPut<{ data: Address } | Address>(
    `/addresses/${id}`,
    data,
  );
  const body = payload.data as Address | { data: Address };
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: Address }).data;
  }
  return body as Address;
}

export async function deleteAddress(id: number | string): Promise<void> {
  await apiDelete(`/addresses/${id}`);
}

export async function setDefaultAddress(
  id: number | string,
): Promise<Address> {
  const payload = await apiPatch<{ data: Address } | Address>(
    `/addresses/${id}/default`,
    {},
  );
  const body = payload.data as Address | { data: Address };
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: Address }).data;
  }
  return body as Address;
}

export default {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
