import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import colors from "../constants/colors";

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export default function FormField({ label, error, style, ...inputProps }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={colors.muted}
        accessibilityLabel={inputProps.accessibilityLabel || label}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
  },
  input: {
    minHeight: 50,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 14,
  },
  inputError: { borderColor: colors.red },
  error: { color: colors.red, fontSize: 11, marginTop: 5 },
});

