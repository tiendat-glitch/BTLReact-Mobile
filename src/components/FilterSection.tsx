// FilterSection — section filter gọn cho màn hình nhỏ (iQOO Z10 Turbo+).
// Hỗ trợ 2 layout: wrap (cho nhóm ít chip ngắn) hoặc horizontal scroll
// (cho nhóm chip dài như CPU/RAM/SSD) — pattern Shopee/Lazada.
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";

type Props = {
  title: string;
  description?: string;
  selectedCount?: number;
  children: React.ReactNode;
  /** Scroll ngang thay vì wrap — phù hợp nhóm chip dài (CPU, GPU…). */
  scroll?: boolean;
  /** Style override cho container chip. */
  contentStyle?: ViewStyle;
};

export default function FilterSection({
  title,
  description,
  selectedCount = 0,
  children,
  scroll = false,
  contentStyle,
}: Props) {
  const content = scroll ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.wrap, contentStyle]}>{children}</View>
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {selectedCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{selectedCount}</Text>
            </View>
          ) : null}
        </View>
        {description ? (
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        ) : null}
      </View>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.px8,
  },
  header: { marginBottom: spacing.px4 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px6,
  },
  title: {
    ...typography.bodyStrong,
    fontSize: 12,
    color: colors.text,
    flexShrink: 1,
  },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: colors.radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.white,
  },
  description: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 1,
  },
  // Wrap grid (mặc định).
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  // Horizontal scroll — chip tự quản marginRight để đều.
  scrollContent: {
    paddingRight: spacing.px12,
    alignItems: "center",
  },
});
