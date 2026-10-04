// ScreenHeader — header bar dùng cho các màn hình detail (Cart, Orders...).
// Đã redesign: shadow subtle, title căn giữa, action slot bên phải.
import React, { type ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ChevronLeft from "lucide-react-native/icons/chevron-left";

import colors from "../constants/colors";
import shadows from "../constants/shadows";
import spacing from "../constants/spacing";
import typography from "../constants/typography";

type Props = {
  title: string;
  navigation: { goBack: () => void };
  subtitle?: string;
  action?: ReactNode;
  showBack?: boolean;
  background?: string;
};

export default function ScreenHeader({
  title,
  navigation,
  subtitle,
  action,
  showBack = true,
  background = colors.surface,
}: Props) {
  return (
    <View
      style={[
        styles.header,
        { backgroundColor: background },
        shadows.none,
      ]}
    >
      {showBack ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={navigation.goBack}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <ChevronLeft color={colors.text} size={26} strokeWidth={2.4} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backButton} />
      )}
      <View style={styles.titleColumn}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.action}>{action}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.px8,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  titleColumn: { flex: 1, alignItems: "center" },
  title: {
    ...typography.h3,
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
  },
  action: {
    minWidth: 48,
    alignItems: "flex-end",
    paddingRight: spacing.px8,
  },
});
