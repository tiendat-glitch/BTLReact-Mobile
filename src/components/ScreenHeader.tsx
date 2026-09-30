import React, { type ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ChevronLeft from "lucide-react-native/icons/chevron-left";

import colors from "../constants/colors";

type Props = {
  title: string;
  navigation: { goBack: () => void };
  action?: ReactNode;
};

export default function ScreenHeader({ title, navigation, action }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={navigation.goBack}
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
      >
        <ChevronLeft color={colors.text} size={25} strokeWidth={2.4} />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.action}>{action}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
  },
  backButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  action: { width: 44, alignItems: "flex-end" },
});
