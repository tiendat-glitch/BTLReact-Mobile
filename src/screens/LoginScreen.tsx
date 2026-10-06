// LoginScreen — hero gradient, form lớn rõ ràng, CTA đậm.
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import LogIn from "lucide-react-native/icons/log-in";
import Mail from "lucide-react-native/icons/mail";
import Lock from "lucide-react-native/icons/lock";
import Eye from "lucide-react-native/icons/eye";
import EyeOff from "lucide-react-native/icons/eye-off";
import { Pressable } from "react-native";

import Button from "../components/Button";
import Card from "../components/Card";
import FormField from "../components/FormField";
import colors from "../constants/colors";
import shadows from "../constants/shadows";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation, route }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await login({ email: email.trim(), password });
      navigation.replace(route.params?.redirectTo || "Main");
    } catch (nextError: any) {
      setError(nextError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.backButton,
                pressed ? styles.pressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Quay lại"
            >
              <ChevronLeft color={colors.text} size={24} strokeWidth={2.4} />
            </Pressable>
          </View>

          <View style={styles.heroBlock}>
            <View style={styles.logoBadge}>
              <LogIn color={colors.white} size={26} strokeWidth={2.4} />
            </View>
            <Text style={styles.eyebrow}>COMPUTER STORE</Text>
            <Text style={styles.title}>Chào mừng trở lại</Text>
            <Text style={styles.subtitle}>
              Đăng nhập để theo dõi đơn, quản lý địa chỉ và bảo hành.
            </Text>
          </View>

          <Card padding="lg" radius="xl" style={styles.formCard}>
            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="email@example.com"
            />
            <FormField
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoComplete="password"
              secureTextEntry={!showPassword}
              placeholder="Tối thiểu 6 ký tự"
              onSubmitEditing={submit}
            />
            <View style={styles.passwordRow}>
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                style={styles.showPassBtn}
                accessibilityRole="button"
              >
                {showPassword ? (
                  <EyeOff
                    color={colors.gray}
                    size={16}
                    strokeWidth={2.2}
                  />
                ) : (
                  <Eye color={colors.gray} size={16} strokeWidth={2.2} />
                )}
                <Text style={styles.showPassText}>
                  {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                </Text>
              </Pressable>
              <Pressable accessibilityRole="button">
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </Pressable>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              label="Đăng nhập"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              leadingIcon={(color: string) => (
                <LogIn color={color} size={20} strokeWidth={2.4} />
              )}
              onPress={submit}
            />
          </Card>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>hoặc</Text>
            <View style={styles.divider} />
          </View>

          <Button
            variant="secondary"
            size="lg"
            label="Tạo tài khoản mới"
            onPress={() =>
              navigation.replace("Register", {
                redirectTo: route.params?.redirectTo,
              })
            }
          />

          <View style={styles.legalRow}>
            <Text style={styles.legalText}>
              Bằng việc tiếp tục, bạn đồng ý với Điều khoản & Chính sách bảo mật
              của cửa hàng.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.px20,
    paddingBottom: spacing.px40,
  },
  topBar: { paddingTop: spacing.px4, paddingBottom: spacing.px8 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: colors.radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  heroBlock: {
    alignItems: "flex-start",
    paddingTop: spacing.px12,
    paddingBottom: spacing.px24,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: colors.radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.px16,
    ...shadows.floating,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginTop: spacing.px6,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.px6,
    maxWidth: 320,
  },
  formCard: {
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -spacing.px6,
    marginBottom: spacing.px16,
  },
  showPassBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  showPassText: {
    ...typography.caption,
    color: colors.gray,
  },
  forgotText: {
    ...typography.captionStrong,
    color: colors.primary,
  },
  errorBox: {
    backgroundColor: colors.dangerLight,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    marginBottom: spacing.px16,
    borderWidth: 1,
    borderColor: colors.dangerSoft,
  },
  errorText: {
    ...typography.captionStrong,
    color: colors.danger,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px12,
    marginVertical: spacing.px20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.gray,
  },
  legalRow: {
    marginTop: spacing.px24,
  },
  legalText: {
    ...typography.caption,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 18,
  },
});
