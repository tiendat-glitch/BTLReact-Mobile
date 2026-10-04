// SectionHeader — eyebrow + title + action; dùng cho mỗi block danh sách.
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";

import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";

type Props = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  style?: object;
};

export default function SectionHeader({
  title,
  subtitle,
  eyebrow,
  action,
  icon: Icon,
  style,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleRow}>
        {Icon ? (
          <View style={styles.iconBox}>
            <Icon color={colors.primary} size={16} strokeWidth={2.2} />
          </View>
        ) : null}
        <View style={styles.text}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {action ? <View style={styles.action}>{action}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.px12 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: colors.radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.px10,
  },
  text: { flex: 1 },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
    marginBottom: 2,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
  },
  action: { marginLeft: 12 },
});
