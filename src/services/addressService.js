import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "./httpClient";

export async function getAddresses() {
  const payload = await apiGet("/addresses");
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function createAddress(data) {
  return (await apiPost("/addresses", data)).data;
}

export async function updateAddress(id, data) {
  return (await apiPut(`/addresses/${id}`, data)).data;
}

export async function deleteAddress(id) {
  await apiDelete(`/addresses/${id}`);
}

export async function setDefaultAddress(id) {
  return (await apiPatch(`/addresses/${id}/default`, {})).data;
}

export default {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};

