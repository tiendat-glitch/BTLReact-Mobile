import { API_BASE_URL, API_TIMEOUT_MS } from "../config/api";

let accessToken = null;
let unauthorizedHandler = null;

export function setApiAccessToken(token) {
  accessToken = token || null;
}

export function setApiUnauthorizedHandler(handler) {
  unauthorizedHandler = handler || null;
}

export class ApiError extends Error {
  constructor(message, { code = "API_ERROR", status = 0, details = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError("Máy chủ trả về dữ liệu không hợp lệ.", {
      code: "INVALID_RESPONSE",
      status: response.status,
    });
  }
}

export async function apiRequest(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
      signal: controller.signal,
    });
    const payload = await parseResponse(response);

    if (!response.ok) {
      if (response.status === 401 && accessToken && unauthorizedHandler) {
        unauthorizedHandler();
      }
      throw new ApiError(
        payload?.message || "Không thể xử lý yêu cầu. Vui lòng thử lại.",
        {
          code: payload?.code || `HTTP_${response.status}`,
          status: response.status,
          details: payload?.details,
        }
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === "AbortError") {
      throw new ApiError("Kết nối tới máy chủ đã hết thời gian chờ.", {
        code: "TIMEOUT",
      });
    }

    throw new ApiError(
      "Không thể kết nối tới máy chủ. Kiểm tra địa chỉ API và mạng của thiết bị.",
      { code: "NETWORK_ERROR" }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiGet = (path, options) =>
  apiRequest(path, { ...options, method: "GET" });

export const apiPost = (path, body, options) =>
  apiRequest(path, {
    ...options,
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

export const apiPut = (path, body, options) =>
  apiRequest(path, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });

export const apiPatch = (path, body, options) =>
  apiRequest(path, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const apiDelete = (path, options) =>
  apiRequest(path, { ...options, method: "DELETE" });

