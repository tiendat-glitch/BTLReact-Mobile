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

export default function LoginScreen({ navigation, route }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.eyebrow}>BTL COMPUTER STORE</Text>
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>
          Quản lý giỏ hàng, địa chỉ và theo dõi đơn hàng của bạn.
        </Text>

        <View style={styles.form}>
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
            secureTextEntry
            placeholder="Tối thiểu 6 ký tự"
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
              <Text style={styles.primaryText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              navigation.replace("Register", {
                redirectTo: route.params?.redirectTo,
              })
            }
            accessibilityRole="button"
          >
            <Text style={styles.secondaryText}>Chưa có tài khoản? Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 24, justifyContent: "center" },
  backButton: {
    position: "absolute",
    left: 18,
    top: 14,
    width: 44,
    height: 44,
    justifyContent: "center",
  },
  backText: { color: colors.text, fontSize: 36 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "900" },
  title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 8 },
  subtitle: { color: colors.gray, fontSize: 14, lineHeight: 21, marginTop: 8 },
  form: { marginTop: 28 },
  formError: {
    color: colors.red,
    backgroundColor: "#FEF2F2",
    borderRadius: colors.radius.sm,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
    padding: 11,
  },
  primaryButton: {
    minHeight: 52,
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: colors.radius.sm,
    justifyContent: "center",
  },
  disabledButton: { opacity: 0.65 },
  primaryText: { color: colors.white, fontSize: 15, fontWeight: "900" },
  secondaryButton: { minHeight: 48, alignItems: "center", justifyContent: "center" },
  secondaryText: { color: colors.primary, fontSize: 13, fontWeight: "700" },
});

