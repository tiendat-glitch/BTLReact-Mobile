// CategoryChip — icon trên label, pill / bo góc. Style dùng cho thanh ngang
// trên Home & Catalog. Đã redesign để gọn, cân đối, có selected/disabled.
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { LucideIcon } from "lucide-react-native";

import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";

type Props = {
  id: string;
  name: string;
  icon?: LucideIcon;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function CategoryChip({
  name,
  icon: Icon,
  selected = false,
  onPress,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Danh mục ${name}`}
      style={[styles.container, selected ? styles.selected : null, style]}
    >
      <View
        style={[styles.iconBox, selected ? styles.iconBoxSelected : null]}
      >
        {Icon ? (
          <Icon
            color={selected ? colors.primary : colors.textSubtle}
            size={22}
            strokeWidth={selected ? 2.4 : 2}
          />
        ) : null}
      </View>
      <Text
        style={[styles.name, selected ? styles.nameSelected : null]}
        numberOfLines={2}
      >
        {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 78,
    alignItems: "center",
    marginRight: spacing.px12,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: colors.radius.lg,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: {},
  iconBoxSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  name: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.px8,
    textAlign: "center",
  },
  nameSelected: {
    ...typography.captionStrong,
    color: colors.primary,
  },
});
