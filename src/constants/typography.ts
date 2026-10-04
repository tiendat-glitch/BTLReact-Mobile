// Typography scale — sử dụng system font để không phụ thuộc asset.
// Mọi text trong app PHẢI lấy từ đây, không hard-code fontSize/fontWeight.
import { Platform, type TextStyle } from "react-native";

const fontFamily: string = (Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "System",
}) ?? "System") as string;

type Weight = "400" | "500" | "600" | "700" | "800" | "900";
const w = (weight: Weight): Weight => weight;

const build = (
  fontSize: number,
  lineHeight: number,
  fontWeight: Weight,
  letterSpacing: number = 0,
): TextStyle => ({
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
});

export const typography: Record<string, TextStyle> = {
  // Display / Heading — dùng cho hero, big numbers
  display: build(34, 40, w("900"), -0.5),
  h1: build(26, 32, w("800"), -0.3),
  h2: build(22, 28, w("800"), -0.2),
  h3: build(18, 24, w("800"), -0.1),
  h4: build(16, 22, w("700")),

  // Body
  body: build(15, 22, w("500")),
  bodyStrong: build(15, 22, w("700")),
  bodyLead: build(17, 26, w("600")),

  // Small
  small: build(13, 20, w("500")),
  smallStrong: build(13, 20, w("700")),

  // Caption
  caption: build(12, 18, w("500")),
  captionStrong: build(12, 18, w("700")),

  // Micro — chip, badge, overline nhỏ
  micro: build(11, 14, w("700"), 0.2),
  eyebrow: build(11, 14, w("800"), 0.8),

  // Price
  priceXl: build(26, 30, w("900"), -0.3),
  priceLg: build(22, 26, w("900"), -0.2),
  priceMd: build(16, 20, w("900")),
  priceSm: build(14, 18, w("800")),

  // Button
  button: build(15, 20, w("800"), 0.2),
  buttonSm: build(13, 18, w("800"), 0.2),
  buttonLg: build(16, 22, w("800"), 0.2),

  // Number / stat
  number: build(28, 32, w("900"), -0.4),
};

export type Typography = typeof typography;
export default typography;
