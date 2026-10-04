// ScreenContainer — wrapper có SafeArea + padding ngang + bottom gutter.
import React, { useMemo } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import colors from "../constants/colors";
import spacing from "../constants/spacing";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  background?: string;
  edges?: ReadonlyArray<Edge>;
  contentStyle?: StyleProp<ViewStyle>;
  horizontalPadding?: number;
  bottomGutter?: number;
  statusBarStyle?: "default" | "light-content" | "dark-content";
  refreshControl?: React.ReactElement;
};

export default function ScreenContainer({
  children,
  scroll = false,
  background = colors.background,
  edges = ["top", "bottom"],
  contentStyle,
  horizontalPadding = spacing.px16,
  bottomGutter = spacing.px80,
  statusBarStyle = "dark-content",
  refreshControl,
}: Props) {
  const paddingStyle = useMemo(
    () => ({
      paddingHorizontal: horizontalPadding,
      paddingBottom: bottomGutter,
    }),
    [horizontalPadding, bottomGutter],
  );

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: background }]}
      edges={edges}
    >
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={background}
        translucent={false}
      />
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[paddingStyle, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          {...(refreshControl
            ? { refreshControl: refreshControl as any }
            : {})}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, paddingStyle, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flex: 1 },
});
