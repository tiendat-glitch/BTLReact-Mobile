// BottomSheet — modal dạng kéo lên từ dưới, có handle, animation mượt.
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import X from "lucide-react-native/icons/x";

import colors from "../constants/colors";
import shadows from "../constants/shadows";
import spacing from "../constants/spacing";
import typography from "../constants/typography";

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeightRatio?: number;
  style?: StyleProp<ViewStyle>;
};

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const START_OFFSET = SCREEN_HEIGHT;

export default function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxHeightRatio = 0.86,
  style,
}: Props) {
  const translateY = useRef(new Animated.Value(START_OFFSET)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateY.setValue(START_OFFSET);
      opacity.setValue(0);
    }
  }, [visible, translateY, opacity]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View
          style={[styles.scrim, { opacity }]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Đóng"
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY }] },
            style,
          ]}
        >
          <View style={styles.handle} />
          {title || subtitle ? (
            <View style={styles.header}>
              <View style={styles.headerText}>
                {title ? <Text style={styles.title}>{title}</Text> : null}
                {subtitle ? (
                  <Text style={styles.subtitle}>{subtitle}</Text>
                ) : null}
              </View>
              <Pressable
                style={styles.closeButton}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Đóng"
              >
                <X color={colors.textSubtle} size={20} strokeWidth={2.2} />
              </Pressable>
            </View>
          ) : null}
          <View
            style={[
              styles.body,
              { maxHeight: `${Math.round(maxHeightRatio * 100)}%` },
            ]}
          >
            {children}
          </View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay.scrim,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: colors.radius.xxl,
    borderTopRightRadius: colors.radius.xxl,
    paddingHorizontal: spacing.px20,
    paddingTop: spacing.px8,
    paddingBottom: spacing.px24,
    ...shadows.modal,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.lightGray,
    marginTop: spacing.px8,
    marginBottom: spacing.px12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.px16,
  },
  headerText: { flex: 1, paddingRight: spacing.px12 },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.small, color: colors.gray, marginTop: 4 },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: colors.radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  body: { paddingBottom: spacing.px8 },
  footer: {
    paddingTop: spacing.px12,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: spacing.px8,
  },
});
