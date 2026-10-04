// ListRow — một dòng danh sách dùng trong menu (Profile, Settings). Đã thêm
// tone neutral mặc định (icon box tone-on-tone), hỗ trợ switch trailing.
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import type { LucideIcon } from "lucide-react-native";

import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";

type Props = {
  label: string;
  description?: string;
  leadingIcon?: LucideIcon;
  leadingTone?: "primary" | "danger" | "warning" | "success" | "info";
  trailing?: "chevron" | "badge" | "switch" | "value";
  trailingValue?: string;
  badgeLabel?: string;
  disabled?: boolean;
  destructive?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export default function ListRow({
  label,
  description,
  leadingIcon: LeadingIcon,
  leadingTone = "primary",
  trailing = "chevron",
  trailingValue,
  badgeLabel,
  disabled = false,
  destructive = false,
  onPress,
  style,
  labelStyle,
}: Props) {
  const labelColor = destructive ? colors.danger : colors.text;
  const iconBoxBg = destructive
    ? colors.dangerLight
    : leadingTone === "warning"
      ? colors.warningLight
      : leadingTone === "success"
        ? colors.successLight
        : leadingTone === "info"
          ? colors.infoLight
          : colors.primaryLight;
  const iconColor = destructive
    ? colors.danger
    : leadingTone === "warning"
      ? colors.warning
      : leadingTone === "success"
        ? colors.success
        : leadingTone === "info"
          ? colors.info
          : colors.primary;
  const component = (
    <View style={[styles.row, disabled ? styles.disabled : null, style]}>
      {LeadingIcon ? (
        <View
          style={[
            styles.iconBox,
            { backgroundColor: iconBoxBg },
          ]}
        >
          <LeadingIcon color={iconColor} size={18} strokeWidth={2.2} />
        </View>
      ) : null}
      <View style={styles.body}>
        <Text
          style={[styles.label, { color: labelColor }, labelStyle]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
      {trailing === "badge" && badgeLabel ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      ) : trailing === "value" && trailingValue ? (
        <Text style={styles.value} numberOfLines={1}>
          {trailingValue}
        </Text>
      ) : null}
      {trailing === "chevron" ? (
        <ChevronRight color={colors.muted} size={20} strokeWidth={2.2} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          pressed && !disabled ? styles.pressed : null,
        ]}
      >
        {component}
      </Pressable>
    );
  }
  return component;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 60,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.px16,
    paddingVertical: spacing.px10,
    gap: spacing.px12,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  disabled: { opacity: 0.55 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: colors.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1 },
  label: {
    ...typography.bodyStrong,
  },
  description: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: colors.radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  badgeText: {
    ...typography.micro,
    color: colors.white,
  },
  value: {
    ...typography.caption,
    color: colors.gray,
  },
});
