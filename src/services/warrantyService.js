import { apiGet } from "./httpClient";

export async function getWarranties() {
  const payload = await apiGet("/warranties");
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function lookupWarranty(serialNumber) {
  return (await apiGet(`/warranties/serial/${encodeURIComponent(serialNumber.trim())}`)).data;
}

export default { getWarranties, lookupWarranty };

