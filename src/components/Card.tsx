// Card — component nền tảng cho mọi khối nội dung. Có 3 variant:
//   flat:  không viền, dùng cho card nổi trên nền cùng tông
//   outlined: có viền nhẹ (mặc định)
//   elevated: đổ bóng nổi bật (modal, sheet content)
//
// Padding theo 4 cấp, radius theo 4 cấp — luôn lấy từ token.
import React from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import colors from "../constants/colors";
import shadows from "../constants/shadows";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "flat" | "elevated" | "tonal";
  padding?: "none" | "sm" | "md" | "lg";
  radius?: "sm" | "md" | "lg" | "xl";
};

const PADDING = {
  none: 0,
  sm: 12,
  md: 16,
  lg: 20,
} as const;

const RADIUS = {
  sm: colors.radius.sm,
  md: colors.radius.md,
  lg: colors.radius.lg,
  xl: colors.radius.xl,
} as const;

export default function Card({
  children,
  style,
  variant = "default",
  padding = "md",
  radius = "md",
}: Props) {
  const variantStyle =
    variant === "flat"
      ? styles.flat
      : variant === "tonal"
        ? styles.tonal
        : variant === "elevated"
          ? styles.elevated
          : styles.outlined;
  return (
    <View
      style={[
        styles.base,
        { padding: PADDING[padding], borderRadius: RADIUS[radius] },
        variantStyle,
        variant === "elevated" ? shadows.card : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {},
  tonal: {
    backgroundColor: colors.surfaceMuted,
  },
  elevated: {
    borderWidth: 0,
  },
});
