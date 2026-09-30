import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import FormField from "../components/FormField";
import colors from "../constants/colors";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen({ navigation, route }) {
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

  const update = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));

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
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim(),
        password: form.password,
      });
      navigation.replace(route.params?.redirectTo || "Main");
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.eyebrow}>TÀI KHOẢN KHÁCH HÀNG</Text>
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>Thông tin này dùng cho giao hàng và bảo hành.</Text>

        <View style={styles.form}>
          <FormField label="Họ và tên" value={form.fullName} onChangeText={update("fullName")} />
          <FormField
            label="Số điện thoại"
            value={form.phone}
            onChangeText={update("phone")}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          <FormField
            label="Email"
            value={form.email}
            onChangeText={update("email")}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <FormField
            label="Mật khẩu"
            value={form.password}
            onChangeText={update("password")}
            secureTextEntry
            autoComplete="new-password"
          />
          <FormField
            label="Xác nhận mật khẩu"
            value={form.confirmPassword}
            onChangeText={update("confirmPassword")}
            secureTextEntry
            onSubmitEditing={submit}
          />
          {error ? <Text style={styles.formError}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
            onPress={submit}
            disabled={isSubmitting}
            accessibilityRole="button"
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryText}>Đăng ký</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.replace("Login", route.params)}
          >
            <Text style={styles.secondaryText}>Đã có tài khoản? Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 24, paddingTop: 76 },
  backButton: { position: "absolute", left: 18, top: 14, width: 44, height: 44, justifyContent: "center" },
  backText: { color: colors.text, fontSize: 36 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "900" },
  title: { color: colors.text, fontSize: 28, fontWeight: "900", marginTop: 8 },
  subtitle: { color: colors.gray, fontSize: 14, lineHeight: 21, marginTop: 8 },
  form: { marginTop: 24 },
  formError: { color: colors.red, backgroundColor: "#FEF2F2", borderRadius: colors.radius.sm, fontSize: 12, marginBottom: 14, padding: 11 },
  primaryButton: { minHeight: 52, alignItems: "center", backgroundColor: colors.primary, borderRadius: colors.radius.sm, justifyContent: "center" },
  disabledButton: { opacity: 0.65 },
  primaryText: { color: colors.white, fontSize: 15, fontWeight: "900" },
  secondaryButton: { minHeight: 48, alignItems: "center", justifyContent: "center" },
  secondaryText: { color: colors.primary, fontSize: 13, fontWeight: "700" },
});
