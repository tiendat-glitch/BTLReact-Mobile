import { API_BASE_URL } from "../config/api";

const API_ORIGIN = new URL(API_BASE_URL).origin;

const normalizeUploadPath = (path: string): string =>
  path.replace(/^\/api\/uploads(?=\/|$)/, "/uploads");

export const resolveImageUrl = (
  value: string | null | undefined,
): string | null => {
  const imageUrl = value?.trim();
  if (!imageUrl) return null;
  if (/^[a-z][a-z\d+.-]*:/i.test(imageUrl)) {
    const parsedUrl = new URL(imageUrl);
    const isLocalHost = ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(
      parsedUrl.hostname,
    );
    if (isLocalHost) {
      return `${API_ORIGIN}${normalizeUploadPath(parsedUrl.pathname)}${parsedUrl.search}${parsedUrl.hash}`;
    }
    if (parsedUrl.origin === API_ORIGIN) {
      parsedUrl.pathname = normalizeUploadPath(parsedUrl.pathname);
      return parsedUrl.toString();
    }
    return imageUrl;
  }
  if (imageUrl.startsWith("//")) {
    const parsedUrl = new URL(`${new URL(API_BASE_URL).protocol}${imageUrl}`);
    if (["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(parsedUrl.hostname)) {
      return `${API_ORIGIN}${normalizeUploadPath(parsedUrl.pathname)}${parsedUrl.search}${parsedUrl.hash}`;
    }
    return parsedUrl.toString();
  }
  return `${API_ORIGIN}${normalizeUploadPath(`/${imageUrl.replace(/^\/+/, "")}`)}`;
};
