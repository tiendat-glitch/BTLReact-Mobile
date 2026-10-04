// RegisterScreen — tương tự LoginScreen nhưng form dài hơn và CTA là "Đăng ký".
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import UserPlus from "lucide-react-native/icons/user-plus";

import Button from "../components/Button";
import Card from "../components/Card";
import FormField from "../components/FormField";
import colors from "../constants/colors";
import shadows from "../constants/shadows";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen({ navigation, route }: any) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field: string) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.password) {
      setError("Họ tên, email và mật khẩu là bắt buộc.");
      return;
    }
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await register({
        full_name: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim(),
        password: form.password,
      } as any);
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
            <View style={[styles.logoBadge, { backgroundColor: colors.accent }]}>
              <UserPlus color={colors.white} size={26} strokeWidth={2.4} />
            </View>
            <Text style={styles.eyebrow}>TÀI KHOẢN KHÁCH HÀNG</Text>
            <Text style={styles.title}>Tạo tài khoản mới</Text>
            <Text style={styles.subtitle}>
              Dùng để theo dõi đơn hàng, lưu địa chỉ và bảo hành.
            </Text>
          </View>

          <Card padding="lg" radius="xl" style={styles.formCard}>
            <FormField
              label="Họ và tên"
              value={form.fullName}
              onChangeText={update("fullName")}
              placeholder="Nguyễn Văn A"
            />
            <FormField
              label="Số điện thoại"
              value={form.phone}
              onChangeText={update("phone")}
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholder="0xx xxx xxxx"
            />
            <FormField
              label="Email"
              value={form.email}
              onChangeText={update("email")}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="email@example.com"
            />
            <FormField
              label="Mật khẩu"
              value={form.password}
              onChangeText={update("password")}
              secureTextEntry
              autoComplete="new-password"
              placeholder="Tối thiểu 6 ký tự"
              helper="Dùng chữ, số và ký tự đặc biệt để tăng độ mạnh."
            />
            <FormField
              label="Xác nhận mật khẩu"
              value={form.confirmPassword}
              onChangeText={update("confirmPassword")}
              secureTextEntry
              onSubmitEditing={submit}
            />
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            <Button
              label="Đăng ký tài khoản"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              leadingIcon={(color: string) => (
                <UserPlus color={color} size={20} strokeWidth={2.4} />
              )}
              onPress={submit}
            />
          </Card>

          <View style={styles.footer}>
            <Pressable
              onPress={() => navigation.replace("Login", route.params)}
              accessibilityRole="button"
              style={styles.footerLink}
            >
              <Text style={styles.footerText}>
                Đã có tài khoản?{" "}
                <Text style={styles.footerTextAccent}>Đăng nhập</Text>
              </Text>
            </Pressable>
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.px16,
    ...shadows.floating,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.accent,
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
  },
  formCard: {
    backgroundColor: colors.surface,
    ...shadows.card,
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
  footer: {
    alignItems: "center",
    marginTop: spacing.px20,
  },
  footerLink: { padding: spacing.px8 },
  footerText: {
    ...typography.body,
    color: colors.gray,
  },
  footerTextAccent: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
});
