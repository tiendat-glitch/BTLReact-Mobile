import { apiGet, apiPatch } from "./httpClient";

export async function getNotifications(page = 1) {
  const payload = await apiGet(`/notifications?page=${page}&limit=50`);
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function markNotificationRead(id) {
  await apiPatch(`/notifications/${id}/read`, {});
}

export async function markAllNotificationsRead() {
  await apiPatch("/notifications/read-all", {});
}

export default { getNotifications, markNotificationRead, markAllNotificationsRead };

