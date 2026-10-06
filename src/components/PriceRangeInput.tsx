// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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

const formatVndShort = (value: number) => {
  if (value >= 1_000_000_000)
    return `${(value / 1_000_000_000).toFixed(value % 1_000_000_000 === 0 ? 0 : 1)} tỷ`;
  if (value >= 1_000_000)
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)} triệu`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toString();
};

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

  const handleClear = () => {
    setMinText("");
    setMaxText("");
    onChange({ min: null, max: null });
  };

  // Các nấc giá gợi ý nhanh, giúp user chọn nhanh thay vì gõ.
  const quickRanges = [
    { label: "Dưới 10 triệu", min: null, max: 10_000_000 },
    { label: "10 – 20 triệu", min: 10_000_000, max: 20_000_000 },
    { label: "20 – 35 triệu", min: 20_000_000, max: 35_000_000 },
    { label: "Trên 35 triệu", min: 35_000_000, max: null },
  ];

  const isRangeActive = (range: { min: number | null; max: number | null }) =>
    minValue === range.min && maxValue === range.max;

  return (
    <View>
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
        <View style={styles.dash}>
          <View style={styles.dashLine} />
        </View>
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

      {/* Quick range chips */}
      <View style={styles.quickRow}>
        {quickRanges.map((range) => {
          const active = isRangeActive(range);
          return (
            <Pressable
              key={range.label}
              onPress={() => {
                setMinText(range.min ? formatVnd(range.min) : "");
                setMaxText(range.max ? formatVnd(range.max) : "");
                onChange({ min: range.min, max: range.max });
              }}
              style={({ pressed }) => [
                styles.quickChip,
                active && styles.quickChipActive,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Khoảng giá ${range.label}`}
            >
              <Text
                style={[
                  styles.quickChipText,
                  active && styles.quickChipTextActive,
                ]}
                numberOfLines={1}
              >
                {range.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {(minValue != null || maxValue != null) ? (
        <Pressable
          onPress={handleClear}
          style={styles.clearRow}
          accessibilityRole="button"
          accessibilityLabel="Xóa khoảng giá"
        >
          <Text style={styles.clearText}>Xóa khoảng giá</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
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
    paddingHorizontal: spacing.px10,
    minHeight: 38,
  },
  input: {
    ...typography.bodyStrong,
    fontSize: 14,
    flex: 1,
    color: colors.text,
    paddingVertical: 0,
    margin: 0,
  },
  suffix: { ...typography.caption, color: colors.gray, marginLeft: spacing.px2 },
  dash: {
    width: 10,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  dashLine: {
    width: 6,
    height: 1.5,
    backgroundColor: colors.lightGray,
    borderRadius: 1,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.px8,
  },
  quickChip: {
    paddingHorizontal: spacing.px10,
    paddingVertical: 5,
    borderRadius: colors.radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.px6,
    marginBottom: spacing.px6,
  },
  quickChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  quickChipText: {
    ...typography.captionStrong,
    fontSize: 12,
    color: colors.text,
  },
  quickChipTextActive: {
    color: colors.primary,
  },
  clearRow: {
    alignSelf: "flex-start",
    marginTop: 2,
    paddingVertical: 2,
  },
  clearText: {
    ...typography.captionStrong,
    color: colors.danger,
  },
});
