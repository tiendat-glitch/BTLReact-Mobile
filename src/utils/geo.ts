/**
 * Tính khoảng cách Haversine giữa 2 điểm lat/lng (km)
 */
export const haversineKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // bán kính Trái đất (km)
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format khoảng cách gọn: "1.2 km", "850 m", "12.4 km"
 */
export const formatDistance = (km: number | null | undefined): string => {
  if (km == null || !Number.isFinite(km)) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
};

/**
 * Parse opening_hours dạng "08:30 - 21:00" thành { open: number, close: number } theo phút từ 00:00
 */
export const parseOpeningHours = (
  openingHours: string | null | undefined,
): { openMinutes: number; closeMinutes: number } | null => {
  if (!openingHours) return null;
  const match = openingHours.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const [, oh, om, ch, cm] = match;
  return {
    openMinutes: Number(oh) * 60 + Number(om),
    closeMinutes: Number(ch) * 60 + Number(cm),
  };
};

export const isStoreOpen = (openingHours: string | null | undefined): boolean => {
  const parsed = parseOpeningHours(openingHours);
  if (!parsed) return true; // Không rõ giờ → coi như đang mở
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= parsed.openMinutes && minutes <= parsed.closeMinutes;
};

export const getStoreStatusLabel = (
  openingHours: string | null | undefined,
): { label: string; isOpen: boolean } => {
  if (!openingHours) return { label: "Giờ mở cửa: chưa cập nhật", isOpen: true };
  const open = isStoreOpen(openingHours);
  return {
    label: open ? `Đang mở cửa · ${openingHours}` : `Đã đóng · Mở lại ${openingHours}`,
    isOpen: open,
  };
};