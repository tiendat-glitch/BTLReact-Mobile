import { apiGet, apiPatch } from "./httpClient";

type NotificationList =
  | unknown[]
  | { items?: unknown[]; data?: unknown[] | { items?: unknown[] } };

const unwrapList = (payload: { data: NotificationList }): unknown[] => {
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

export async function getNotifications(page = 1): Promise<unknown[]> {
  const payload = await apiGet<NotificationList>(
    `/notifications?page=${page}&limit=50`,
  );
  return unwrapList(payload);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { data } = await apiGet<{
    data?: { count?: number | string };
  }>("/notifications/unread-count");
  const count = Number(data?.data?.count);
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error("Số thông báo chưa đọc không hợp lệ.");
  }
  return count;
}

export async function markNotificationRead(id: number | string): Promise<void> {
  await apiPatch(`/notifications/${id}/read`, {});
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiPatch("/notifications/read-all", {});
}

export default {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
};
