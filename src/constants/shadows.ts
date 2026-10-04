// Hệ elevation — dùng 3 cấp: card, floating (chip nổi, nút), modal.
// Quy tắc:
// - Không elevation nặng cho card nằm trong list (chỉ elevation 1–2).
// - Modal/bottom sheet: elevation 8–12 + shadow lớn.
// - Sticky CTA/tabbar: elevation 6 + shadow lên trên.
import { Platform, type ViewStyle } from "react-native";
import colors from "./colors";

type Level = "none" | "card" | "cardHover" | "floating" | "sticky" | "modal";

const base: Record<Level, ViewStyle> = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHover: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 4,
  },
  floating: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  sticky: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 8,
  },
  modal: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 12,
  },
};

const build = (level: Level): ViewStyle => {
  const style = base[level];
  if (Platform.OS !== "android") return style;
  // Android: chỉ dùng elevation (RN ép shadow)
  return {
    elevation: style.elevation,
    shadowColor: undefined,
    shadowOffset: undefined,
    shadowOpacity: undefined,
    shadowRadius: undefined,
  };
};

export const shadows = {
  none: build("none"),
  card: build("card"),
  cardHover: build("cardHover"),
  floating: build("floating"),
  sticky: build("sticky"),
  modal: build("modal"),
} as const;

export type Shadows = typeof shadows;
export default shadows;
