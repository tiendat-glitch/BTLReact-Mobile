// FilterChip — chip compact theo pattern Shopee/Lazada cho filter sheet.
// Tối ưu cho màn hình nhỏ: minHeight 28, padding 8/4, count badge 14pt.
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Check from "lucide-react-native/icons/check";

import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";

type Props = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  count?: number;
  onPress: () => void;
};

export default function FilterChip({
  label,
  selected = false,
  disabled = false,
  count,
  onPress,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        disabled && styles.chipDisabled,
        pressed && !disabled && styles.chipPressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
    >
      {selected ? (
        <Check
          color={colors.white}
          size={11}
          strokeWidth={3}
          style={styles.check}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          selected && styles.labelSelected,
          disabled && styles.labelDisabled,
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
      {typeof count === "number" ? (
        <View
          style={[
            styles.countBadge,
            selected && styles.countBadgeSelected,
          ]}
        >
          <Text
            style={[
              styles.countText,
              selected && styles.countTextSelected,
            ]}
            numberOfLines={1}
          >
            {count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    minHeight: 28,
    maxWidth: 200,
    borderRadius: colors.radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
    marginRight: spacing.px6,
    marginBottom: spacing.px6,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipPressed: {
    opacity: 0.7,
  },
  check: { marginRight: 3 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    flexShrink: 1,
  },
  labelSelected: { color: colors.white },
  labelDisabled: { color: colors.muted },
  countBadge: {
    minWidth: 16,
    paddingHorizontal: 4,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  countBadgeSelected: {
    backgroundColor: colors.white,
  },
  countText: {
    fontSize: 9,
    fontWeight: "600",
    color: colors.gray,
  },
  countTextSelected: {
    color: colors.primary,
  },
});
