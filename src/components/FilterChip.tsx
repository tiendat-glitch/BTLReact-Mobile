// @ts-nocheck
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
      style={[
        styles.chip,
        selected && styles.chipSelected,
        disabled && styles.chipDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
    >
      {selected ? (
        <Check color={colors.white} size={14} strokeWidth={3} />
      ) : null}
      <Text
        style={[
          styles.label,
          selected && styles.labelSelected,
          disabled && styles.labelDisabled,
        ]}
        numberOfLines={1}
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
    paddingHorizontal: spacing.px12,
    paddingVertical: spacing.px8,
    minHeight: 36,
    borderRadius: colors.radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
    gap: spacing.px6,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  label: {
    ...typography.captionStrong,
    color: colors.text,
  },
  labelSelected: { color: colors.white },
  labelDisabled: { color: colors.muted },
  countBadge: {
    minWidth: 20,
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.px4,
  },
  countBadgeSelected: {
    backgroundColor: colors.white,
  },
  countText: {
    ...typography.micro,
    color: colors.gray,
  },
  countTextSelected: {
    color: colors.primary,
  },
});
