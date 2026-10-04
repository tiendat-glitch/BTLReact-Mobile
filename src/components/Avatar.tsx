// Avatar — chữ cái đầu trong vòng tròn tone-on-tone. Mặc định tone = primary.
import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import colors from "../constants/colors";
import typography from "../constants/typography";

type Tone = "primary" | "warning" | "success" | "info" | "danger";

type Props = {
  name: string;
  size?: number;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
};

const toneBg: Record<Tone, string> = {
  primary: colors.primary,
  warning: colors.warning,
  success: colors.success,
  info: colors.info,
  danger: colors.danger,
};

export default function Avatar({
  name,
  size = 44,
  tone = "primary",
  style,
}: Props) {
  const initials = (name || "U")
    .split(" ")
    .map((part) => part.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: toneBg[tone],
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={`Avatar ${name}`}
    >
      <Text
        style={[styles.label, { fontSize: size * 0.4 }]}
        numberOfLines={1}
      >
        {initials || "U"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...typography.title,
    color: colors.white,
  },
});
