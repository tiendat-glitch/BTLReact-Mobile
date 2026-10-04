// Button — hỗ trợ 6 variant × 3 size, mặc định có hiệu ứng pressed + radius pill.
// Mọi CTA chính nên dùng `primary`; ghost dùng cho link phụ; tonal cho nút
// trong card/hero; danger cho hành động phá hoại.
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import type { LucideIcon } from "lucide-react-native";

import colors from "../constants/colors";
import typography from "../constants/typography";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "tonal"
  | "outlineDanger";

export type ButtonSize = "sm" | "md" | "lg";

type IconRenderer = (color: string) => React.ReactNode;

type Props = Omit<PressableProps, "style" | "children"> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  leadingIcon?: LucideIcon | IconRenderer;
  trailingIcon?: LucideIcon | IconRenderer;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  testID?: string;
};

const renderIcon = (
  icon: LucideIcon | IconRenderer | undefined,
  color: string,
  size: number,
): React.ReactNode => {
  if (!icon) return null;
  if (typeof icon === "function") {
    return icon(color);
  }
  const Component = icon as unknown as React.ComponentType<{
    color?: string;
    size?: number;
    strokeWidth?: number;
  }>;
  return <Component color={color} size={size} strokeWidth={2.2} />;
};

export default function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = true,
  rounded = false,
  leadingIcon,
  trailingIcon,
  iconSize,
  style,
  labelStyle,
  ...pressableProps
}: Props) {
  const palette = paletteFor(variant);
  const sizeStyles = sizeFor(size);
  const computedIconSize = iconSize ?? sizeStyles.iconSize;
  const isDisabled = disabled || loading;

  const renderLabel = () => {
    if (loading) {
      return <ActivityIndicator color={palette.label} size="small" />;
    }
    return (
      <View style={styles.contentRow}>
        {renderIcon(leadingIcon, palette.label, computedIconSize)}
        {label ? (
          <Text
            style={[
              styles.label,
              sizeStyles.label,
              { color: palette.label },
              labelStyle,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        ) : null}
        {renderIcon(trailingIcon, palette.label, computedIconSize)}
      </View>
    );
  };

  return (
    <Pressable
      {...pressableProps}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles.container,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          borderWidth: palette.borderWidth,
          borderRadius: rounded ? colors.radius.pill : sizeStyles.borderRadius,
        },
        fullWidth ? styles.fullWidth : null,
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {renderLabel()}
    </Pressable>
  );
}

function paletteFor(variant: ButtonVariant) {
  switch (variant) {
    case "primary":
      return {
        background: colors.primary,
        border: colors.primary,
        label: colors.white,
        borderWidth: 0,
      };
    case "secondary":
      return {
        background: colors.primaryLight,
        border: colors.primary,
        label: colors.primaryDark,
        borderWidth: 1,
      };
    case "ghost":
      return {
        background: "transparent",
        border: "transparent",
        label: colors.primary,
        borderWidth: 0,
      };
    case "danger":
      return {
        background: colors.danger,
        border: colors.danger,
        label: colors.white,
        borderWidth: 0,
      };
    case "outlineDanger":
      return {
        background: colors.surface,
        border: colors.danger,
        label: colors.danger,
        borderWidth: 1,
      };
    case "tonal":
      return {
        background: colors.surfaceMuted,
        border: colors.surfaceMuted,
        label: colors.text,
        borderWidth: 0,
      };
  }
}

function sizeFor(size: ButtonSize) {
  switch (size) {
    case "sm":
      return {
        container: {
          minHeight: 36,
          paddingHorizontal: 14,
        },
        label: { ...typography.buttonSm },
        iconSize: 16,
        borderRadius: colors.radius.md,
      };
    case "md":
      return {
        container: { minHeight: 46, paddingHorizontal: 18 },
        label: { ...typography.button },
        iconSize: 18,
        borderRadius: colors.radius.md,
      };
    case "lg":
      return {
        container: { minHeight: 54, paddingHorizontal: 22 },
        label: { ...typography.buttonLg },
        iconSize: 20,
        borderRadius: colors.radius.lg,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: { alignSelf: "stretch" },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: { textAlign: "center" },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
});
