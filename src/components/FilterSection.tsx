// FilterSection — dùng cho bộ lọc trong sheet. Style gọn, title đậm, chip wrap.
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function FilterSection({
  title,
  description,
  children,
}: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
      <View style={styles.chipRow}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.px20 },
  header: { marginBottom: spacing.px10 },
  title: { ...typography.h4, color: colors.text },
  description: { ...typography.caption, color: colors.gray, marginTop: 2 },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.px8,
  },
});
