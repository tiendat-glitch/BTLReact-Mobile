// FilterSection — dùng cho bộ lọc trong sheet. Style gọn, title đậm, chip wrap.
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";

type Props = {
  title: string;
  description?: string;
  selectedCount?: number;
  children: React.ReactNode;
};

export default function FilterSection({
  title,
  description,
  selectedCount = 0,
  children,
}: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {selectedCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{selectedCount}</Text>
            </View>
          ) : null}
        </View>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
      <View style={styles.chipRow}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.px20,
  },
  header: { marginBottom: spacing.px12 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px8,
  },
  title: { ...typography.h4, color: colors.text },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: colors.radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    ...typography.micro,
    color: colors.white,
    fontWeight: "700",
  },
  description: { ...typography.caption, color: colors.gray, marginTop: 4 },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.px8,
  },
});
