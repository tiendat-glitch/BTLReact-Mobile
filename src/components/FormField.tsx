// FormField — input dùng cho form (Login, Register, Address). Có label trên,
// border subtle, focus state đổi màu primary.
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";

type Props = TextInputProps & {
  label: string;
  helper?: string;
  error?: string;
};

export default function FormField({
  label,
  helper,
  error,
  style,
  onFocus,
  onBlur,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          focused ? styles.focused : null,
          error ? styles.inputError : null,
        ]}
      >
        <TextInput
          {...inputProps}
          style={[styles.input, style]}
          placeholderTextColor={colors.muted}
          accessibilityLabel={inputProps.accessibilityLabel || label}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.px16 },
  label: {
    ...typography.captionStrong,
    color: colors.textSubtle,
    marginBottom: spacing.px8,
  },
  inputWrap: {
    minHeight: 50,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: colors.radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.px14,
    justifyContent: "center",
  },
  focused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.danger },
  input: {
    ...typography.body,
    color: colors.text,
    paddingVertical: 0,
    margin: 0,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.px6,
  },
  helper: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.px6,
  },
});
