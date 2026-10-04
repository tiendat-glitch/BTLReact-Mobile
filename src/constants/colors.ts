// BTL Computer Store — Design tokens
//
// Nguyên tắc:
// - Bảng màu lấy cảm hứng từ Shopee/Tiki/Tokopedia: chính (primary) mạnh để
//   CTA nổi bật, neutral ấm (slate → warm) làm nền thay vì xám lạnh.
// - Mọi màu, khoảng cách, radius đều là token, không hard-code trong component.
// - Tone mặc định: light, tin cậy, có điểm nhấn accent (vàng/cam) cho ưu đãi.
// - Tất cả cặp màu text/background đảm bảo WCAG AA (>= 4.5:1 cho body).

// Palette dùng chung — trải phẳng vào `colors`.
const palette: Record<string, string> = {
  // Brand
  primary: "#1B5BFF",          // CTA chính: xanh dương tin cậy, mạnh hơn #2563EB
  primaryDark: "#1648C2",
  primaryLight: "#EAF1FF",
  primarySoft: "#C7D9FF",

  accent: "#F97316",           // Cam ấm cho ưu đãi / "Hot" / giá
  accentDark: "#C2410C",
  accentLight: "#FFF3EA",
  accentSoft: "#FFD9BF",

  // Surface
  background: "#F4F6FB",       // Nền app tone xanh-rêu rất nhạt (ấm hơn)
  surface: "#FFFFFF",
  surfaceMuted: "#EEF1F7",
  surfaceSunken: "#E6EAF2",
  white: "#FFFFFF",

  // Text — phân cấp 5 cấp độ
  text: "#0F1A2E",             // Headline
  textSubtle: "#3A4A66",       // Body nhấn
  gray: "#5B6A85",             // Body phụ
  muted: "#8593AC",            // Caption
  lightGray: "#C4CCDB",        // Divider mảnh

  // Status
  success: "#0F8A5F",
  successLight: "#E6F7EF",
  successSoft: "#B7E7CE",

  warning: "#B45309",
  warningLight: "#FFF6E5",
  warningSoft: "#FCD9A0",

  danger: "#D7263D",
  dangerLight: "#FDECEF",
  dangerSoft: "#F8B8C2",

  info: "#0E7490",
  infoLight: "#E0F4FA",
  infoSoft: "#A8DDE9",

  // Border
  border: "#E2E6EF",
  borderStrong: "#C4CCDB",
  overlay: "rgba(15,26,46,0.45)",
  scrim: "rgba(15,26,46,0.55)",
  shadow: "rgba(15,26,46,0.08)",
  shadowSoft: "rgba(15,26,46,0.04)",
};

// Đổ bóng theo cấp — dùng rgba từ palette để đồng bộ tone.
const elevations = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 4,
  },
  lg: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 12,
  },
};

type ColorsShape = Record<string, any>;
const colors: ColorsShape = {
  ...palette,

  semantic: {
    success: palette.success,
    successLight: palette.successLight,
    successSoft: palette.successSoft,
    warning: palette.warning,
    warningLight: palette.warningLight,
    warningSoft: palette.warningSoft,
    danger: palette.danger,
    dangerLight: palette.dangerLight,
    dangerSoft: palette.dangerSoft,
    info: palette.info,
    infoLight: palette.infoLight,
    infoSoft: palette.infoSoft,
  },

  // Overlay cho modal/toast/dim
  overlay: {
    modal: "rgba(15,26,46,0.45)",
    scrim: "rgba(15,26,46,0.55)",
    wash: "rgba(255,255,255,0.55)",
    tintDark: "rgba(15,26,46,0.04)",
    tintLight: "rgba(255,255,255,0.16)",
    promotionDim: "rgba(15,26,46,0.54)",
    toastBg: "rgba(15,26,46,0.92)",
    glass: "rgba(255,255,255,0.85)",
  },

  // Gradient phổ biến (dùng cho hero, banner, badge)
  gradient: {
    brand: ["#1B5BFF", "#5A8BFF"] as const,
    sunset: ["#FF6A3D", "#FFB347"] as const,
    ocean: ["#0EA5E9", "#1B5BFF"] as const,
    plum: ["#7C3AED", "#EC4899"] as const,
    dark: ["#0F1A2E", "#3A4A66"] as const,
  },

  // Scale bán kính — dùng nhất quán
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    pill: 999,
  },

  // Layout metrics
  layout: {
    contentPadding: 16,
    sectionGap: 24,
    cardGap: 12,
    screenBottomGap: 96,
  },

  // Trạng thái focus & pressed (cho phụ kiện trợ năng)
  state: {
    pressed: 0.7,
    disabled: 0.45,
    hover: 0.85,
  },
} as ColorsShape;

export const elevations_ = elevations; // optional re-export nếu cần ngoài colors
export default colors;
export type Colors = typeof colors;
