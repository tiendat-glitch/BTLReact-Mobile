// @ts-nocheck
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";

type Props = {
  minValue?: number | null;
  maxValue?: number | null;
  onChange: (next: { min: number | null; max: number | null }) => void;
  placeholderMin?: string;
  placeholderMax?: string;
  suffix?: string;
};

const parseNumber = (value: string): number | null => {
  const cleaned = value.replace(/[^\d]/g, "");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatVnd = (value: number) =>
  value.toLocaleString("vi-VN", { maximumFractionDigits: 0 });

export default function PriceRangeInput({
  minValue = null,
  maxValue = null,
  onChange,
  placeholderMin = "Tối thiểu",
  placeholderMax = "Tối đa",
  suffix = "đ",
}: Props) {
  const [minText, setMinText] = useState(
    minValue ? formatVnd(minValue) : ""
  );
  const [maxText, setMaxText] = useState(
    maxValue ? formatVnd(maxValue) : ""
  );

  useEffect(() => {
    setMinText(minValue ? formatVnd(minValue) : "");
  }, [minValue]);

  useEffect(() => {
    setMaxText(maxValue ? formatVnd(maxValue) : "");
  }, [maxValue]);

  const handleMin = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, "");
    const parsed = parseNumber(digits);
    setMinText(digits ? formatVnd(Number(digits)) : "");
    onChange({ min: parsed, max: maxValue });
  };

  const handleMax = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, "");
    const parsed = parseNumber(digits);
    setMaxText(digits ? formatVnd(Number(digits)) : "");
    onChange({ min: minValue, max: parsed });
  };

  return (
    <View style={styles.row}>
      <View style={styles.inputBox}>
        <Text style={styles.label}>Từ</Text>
        <View style={styles.field}>
          <TextInput
            value={minText}
            onChangeText={handleMin}
            placeholder={placeholderMin}
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            style={styles.input}
            accessibilityLabel="Giá tối thiểu"
          />
          <Text style={styles.suffix}>{suffix}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.inputBox}>
        <Text style={styles.label}>Đến</Text>
        <View style={styles.field}>
          <TextInput
            value={maxText}
            onChangeText={handleMax}
            placeholder={placeholderMax}
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            style={styles.input}
            accessibilityLabel="Giá tối đa"
          />
          <Text style={styles.suffix}>{suffix}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.px8,
  },
  inputBox: { flex: 1 },
  label: {
    ...typography.captionStrong,
    color: colors.gray,
    marginBottom: spacing.px4,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    borderRadius: colors.radius.md,
    paddingHorizontal: spacing.px12,
    minHeight: 44,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    paddingVertical: 0,
    margin: 0,
  },
  suffix: { ...typography.caption, color: colors.gray, marginLeft: spacing.px4 },
  divider: { width: spacing.px8, height: 1 },
});
