// SearchBar — pill lớn, focus state mạnh, hint rõ ràng. Style lấy cảm hứng
// từ Shopee/Lazada (search bar ở giữa, ưu tiên thị giác).
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Search from "lucide-react-native/icons/search";
import X from "lucide-react-native/icons/x";

import colors from "../constants/colors";
import shadows from "../constants/shadows";
import spacing from "../constants/spacing";
import typography from "../constants/typography";

type Props = {
  value: string;
  onChangeText: (next: string) => void;
  onSubmitEditing?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  trailing?: React.ReactNode;
  variant?: "floating" | "inline";
  style?: StyleProp<ViewStyle>;
};

export default function SearchBar({
  value,
  onChangeText,
  onSubmitEditing,
  onFocus,
  onBlur,
  placeholder = "Tìm laptop, linh kiện, phụ kiện...",
  trailing,
  variant = "floating",
  style,
}: Props) {
  const [focused, setFocused] = useState(false);
  const isFloating = variant === "floating";

  return (
    <View
      style={[
        styles.container,
        isFloating ? styles.floating : styles.inline,
        focused ? styles.focused : null,
        style,
      ]}
    >
      <Search
        color={focused ? colors.primary : colors.gray}
        size={20}
        strokeWidth={2.2}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.();
        }}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        accessibilityLabel="Tìm kiếm sản phẩm"
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText("")}
          accessibilityRole="button"
          accessibilityLabel="Xóa từ khóa"
          style={styles.iconButton}
          hitSlop={8}
        >
          <X color={colors.gray} size={18} strokeWidth={2.4} />
        </Pressable>
      ) : trailing ? (
        <View style={styles.trailing}>{trailing}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 16,
    gap: 12,
  },
  floating: {
    borderRadius: colors.radius.lg,
    ...shadows.card,
  },
  inline: {
    borderRadius: colors.radius.md,
  },
  focused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    paddingVertical: 0,
    margin: 0,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: colors.radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  trailing: { paddingLeft: 6 },
});
