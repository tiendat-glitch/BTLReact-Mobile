// StatusBadge — pill màu cho trạng thái đơn hàng, tồn kho, voucher, v.v.
// Soft variant: nền tint, viền cùng tông, chữ đậm. Solid variant: nền đậm.
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import colors from "../constants/colors";
import typography from "../constants/typography";

export type BadgeTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

type Props = {
  label: string;
  tone?: BadgeTone;
  size?: "sm" | "md";
  variant?: "soft" | "solid";
  icon?: React.ReactNode;
};

export default function StatusBadge({
  label,
  tone = "primary",
  size = "sm",
  variant = "soft",
  icon,
}: Props) {
  const palette = tonePalette(tone, variant);
  const sizing = sizeStyle(size);
  return (
    <View
      style={[
        styles.base,
        sizing.container,
        { backgroundColor: palette.bg, borderColor: palette.border },
      ]}
    >
      {icon ? <View style={sizing.icon}>{icon}</View> : null}
      <Text style={[sizing.label, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

function tonePalette(tone: BadgeTone, variant: Props["variant"]) {
  const solid: Record<BadgeTone, { bg: string; fg: string; border: string }> = {
    success: { bg: colors.success, fg: colors.white, border: colors.success },
    warning: { bg: colors.warning, fg: colors.white, border: colors.warning },
    danger: { bg: colors.danger, fg: colors.white, border: colors.danger },
    info: { bg: colors.info, fg: colors.white, border: colors.info },
    neutral: { bg: colors.gray, fg: colors.white, border: colors.gray },
    primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
  };
  const soft: Record<BadgeTone, { bg: string; fg: string; border: string }> = {
    success: {
      bg: colors.successLight,
      fg: colors.success,
      border: colors.successSoft,
    },
    warning: {
      bg: colors.warningLight,
      fg: colors.warning,
      border: colors.warningSoft,
    },
    danger: {
      bg: colors.dangerLight,
      fg: colors.danger,
      border: colors.dangerSoft,
    },
    info: { bg: colors.infoLight, fg: colors.info, border: colors.infoSoft },
    neutral: {
      bg: colors.surfaceMuted,
      fg: colors.gray,
      border: colors.border,
    },
    primary: {
      bg: colors.primaryLight,
      fg: colors.primary,
      border: colors.primarySoft,
    },
  };
  return variant === "solid" ? solid[tone] : soft[tone];
}

function sizeStyle(size: Props["size"]) {
  if (size === "md") {
    return {
      container: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: colors.radius.sm,
        borderWidth: 1,
      },
      label: typography.captionStrong,
      icon: { marginRight: 4 },
    };
  }
  return {
    container: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: colors.radius.sm,
      borderWidth: 1,
    },
    label: typography.micro,
    icon: { marginRight: 3 },
  };
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
});
