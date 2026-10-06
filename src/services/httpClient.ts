import { API_BASE_URL, API_TIMEOUT_MS } from "../config/api";

let accessToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setApiAccessToken(token: string | null): void {
  accessToken = token || null;
}

export function setApiUnauthorizedHandler(
  handler: (() => void) | null,
): void {
  unauthorizedHandler = handler || null;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details: unknown;

  constructor(
    message: string,
    {
      code = "API_ERROR",
      status = 0,
      details = null,
    }: { code?: string; status?: number; details?: unknown } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

type Json = unknown;

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: BodyInit | null;
  /**
   * Query string params. Sẽ được encode và nối vào path.
   * `null`/`undefined` sẽ bị bỏ qua; rỗng / `""` cũng bị bỏ qua.
   */
  params?: Record<string, string | number | null | undefined>;
  // Allow extra fields for callers (e.g. RN fetch)
  [key: string]: unknown;
}

const buildPath = (path: string, params?: Record<string, string | number | null | undefined>) => {
  if (!params) return path;
  const entries = Object.entries(params).filter(
    ([, v]) => v !== null && v !== undefined && v !== "",
  );
  if (entries.length === 0) return path;
  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${qs}`;
};

async function parseResponse(response: Response): Promise<Json> {
  const text = await response.text();
  if (!text) return null;
  // Nếu response trả HTML (ví dụ 404 mặc định của Express "Cannot GET/POST/PATCH..."),
  // parseResponse không nên ném lỗi JSON. Để nguyên text cho caller
  // xử lý ở tầng status check. Khi payload thực sự không phải JSON
  // (server crash trả về text rác), vẫn ném lỗi như cũ.
  if (response.status >= 200 && response.status < 300) {
    try {
      return JSON.parse(text);
    } catch {
      throw new ApiError("Máy chủ trả về dữ liệu không hợp lệ.", {
        code: "INVALID_RESPONSE",
        status: response.status,
      });
    }
  }
  // Lỗi: thử parse JSON trước; nếu không phải (HTML 404), trả object
  // giả với message lấy từ <pre> tag hoặc text thuần.
  try {
    return JSON.parse(text);
  } catch {
    return { message: text.trim().slice(0, 200) };
  }
}

async function rawRequest(
  path: string,
  options: RequestOptions = {},
): Promise<Json> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const { params, ...rest } = options;
  const finalPath = buildPath(path, params);
  try {
    const response = await fetch(`${API_BASE_URL}${finalPath}`, {
      ...rest,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
      signal: controller.signal,
    });
    const payload = (await parseResponse(response)) as
      | { message?: string; code?: string; details?: unknown }
      | null;

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
        },
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if ((error as { name?: string })?.name === "AbortError") {
      throw new ApiError("Kết nối tới máy chủ đã hết thời gian chờ.", {
        code: "TIMEOUT",
      });
    }
    throw new ApiError(
      "Không thể kết nối tới máy chủ. Kiểm tra địa chỉ API và mạng của thiết bị.",
      { code: "NETWORK_ERROR" },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Trả về wrapper `{ data }` để các service có thể destructure:
 *   const { data } = await apiGet<T>(...)
 *
 * Caller truyền generic T để TS infer kiểu trả về.
 */
export async function apiGet<T = unknown>(
  path: string,
  options?: RequestOptions,
): Promise<{ data: T }> {
  const payload = await rawRequest(path, { ...options, method: "GET" });
  return { data: payload as T };
}

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<{ data: T }> {
  const payload = await rawRequest(path, {
    ...options,
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { data: payload as T };
}

export async function apiPut<T = unknown>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<{ data: T }> {
  const payload = await rawRequest(path, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });
  return { data: payload as T };
}

export async function apiPatch<T = unknown>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<{ data: T }> {
  const payload = await rawRequest(path, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return { data: payload as T };
}

export async function apiDelete<T = unknown>(
  path: string,
  options?: RequestOptions,
): Promise<{ data: T }> {
  const payload = await rawRequest(path, { ...options, method: "DELETE" });
  return { data: payload as T };
}
