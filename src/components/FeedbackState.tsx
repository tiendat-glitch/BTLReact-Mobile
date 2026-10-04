// FeedbackState — loading / empty / error hero. Đã redesign cho thân thiện
// hơn: icon trong "halo" tone-on-tone, title đậm, description xám, CTA pill.
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Inbox from "lucide-react-native/icons/inbox";
import TriangleAlert from "lucide-react-native/icons/triangle-alert";
import RefreshCw from "lucide-react-native/icons/refresh-cw";

import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import shadows from "../constants/shadows";

type Props = {
  variant: "loading" | "empty" | "error";
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  fullScreen?: boolean;
  icon?: React.ReactNode;
};

const ICON_SIZE = 40;
const HALO_SIZE = 96;

export default function FeedbackState({
  variant,
  title,
  description,
  onRetry,
  retryLabel = "Thử lại",
  fullScreen = false,
  icon,
}: Props) {
  if (variant === "loading") {
    return (
      <View style={[styles.container, fullScreen && styles.fullScreen]}>
        <ActivityIndicator size="large" color={colors.primary} />
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
    );
  }

  const DefaultIcon = variant === "error" ? TriangleAlert : Inbox;
  const haloBg =
    variant === "error" ? colors.dangerLight : colors.surfaceMuted;
  const iconColor = variant === "error" ? colors.danger : colors.gray;

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <View style={[styles.halo, { backgroundColor: haloBg }]}>
        {icon ?? (
          <DefaultIcon color={iconColor} size={ICON_SIZE} strokeWidth={1.6} />
        )}
      </View>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retry,
            pressed ? styles.retryPressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
        >
          <RefreshCw color={colors.white} size={18} strokeWidth={2.4} />
          <Text style={styles.retryText}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  fullScreen: { flex: 1 },
  halo: {
    width: HALO_SIZE,
    height: HALO_SIZE,
    borderRadius: HALO_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.px20,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    textAlign: "center",
  },
  description: {
    ...typography.body,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 22,
    marginTop: spacing.px8,
    maxWidth: 320,
  },
  retry: {
    marginTop: spacing.px20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: colors.radius.pill,
    ...shadows.floating,
  },
  retryPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  retryText: {
    ...typography.button,
    color: colors.white,
  },
});
