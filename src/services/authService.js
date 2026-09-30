import { apiGet, apiPost } from "./httpClient";

export async function loginRequest({ email, password }) {
  const payload = await apiPost("/auth/login", { email, password });
  return payload.data;
}

export async function registerRequest(data) {
  const payload = await apiPost("/auth/register", data);
  return payload.data;
}

export async function getCurrentUser() {
  const payload = await apiGet("/auth/me");
  return payload.data;
}

export default { loginRequest, registerRequest, getCurrentUser };

