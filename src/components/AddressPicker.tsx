// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Check from "lucide-react-native/icons/check";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import Search from "lucide-react-native/icons/search";
import X from "lucide-react-native/icons/x";

import BottomSheet from "./BottomSheet";
import colors from "../constants/colors";
import {
  PROVINCES,
  searchDistricts,
  searchProvinces,
  type District,
  type Province,
} from "../constants/addressVN";
import spacing from "../constants/spacing";
import typography from "../constants/typography";

type Mode = "province" | "district";

type Props = {
  visible: boolean;
  mode: Mode;
  title: string;
  /** Required for district mode — pre-selected province */
  selectedProvince?: Province | null;
  /** Currently selected name (or code) */
  initialValue?: string;
  onClose: () => void;
  onSelect: (value: { name: string; province?: Province; district?: District }) => void;
};

export default function AddressPicker({
  visible,
  mode,
  title,
  selectedProvince = null,
  initialValue = "",
  onClose,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (visible) setQuery("");
  }, [visible]);

  const provinceList = useMemo(() => searchProvinces(query), [query]);
  const districtList = useMemo(
    () => searchDistricts(selectedProvince || undefined, query),
    [selectedProvince, query]
  );

  const data = mode === "province" ? provinceList : districtList;

  const handleChoose = (item: Province | District) => {
    if (mode === "province") {
      onSelect({ name: (item as Province).name, province: item as Province });
    } else {
      onSelect({
        name: (item as District).name,
        province: selectedProvince || undefined,
        district: item as District,
      });
    }
    onClose();
  };

  const matchesInitial = (name: string) =>
    initialValue.trim().toLowerCase() === name.trim().toLowerCase();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={
        mode === "district" && selectedProvince
          ? `Thuộc ${selectedProvince.name}`
          : `${data.length} lựa chọn`
      }
    >
      <View style={styles.searchBox}>
        <Search color={colors.gray} size={18} strokeWidth={2.2} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={
            mode === "province" ? "Tìm tỉnh/thành phố" : "Tìm quận/huyện"
          }
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
        />
        {query ? (
          <Pressable
            onPress={() => setQuery("")}
            accessibilityRole="button"
            accessibilityLabel="Xoá nội dung tìm"
          >
            <X color={colors.gray} size={18} strokeWidth={2.4} />
          </Pressable>
        ) : null}
      </View>

      {data.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Không tìm thấy kết quả. Hãy thử từ khoá khác.
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.code}
          keyboardShouldPersistTaps="handled"
          style={styles.list}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const active = matchesInitial(item.name);
            return (
              <Pressable
                style={[styles.row, active && styles.rowActive]}
                onPress={() => handleChoose(item)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={item.name}
              >
                <Text
                  style={[
                    styles.rowText,
                    active && styles.rowTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                {active ? (
                  <Check color={colors.primary} size={18} strokeWidth={2.4} />
                ) : (
                  <ChevronRight
                    color={colors.muted}
                    size={16}
                    strokeWidth={2.2}
                  />
                )}
              </Pressable>
            );
          }}
        />
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: colors.radius.md,
    paddingHorizontal: spacing.px12,
    minHeight: 44,
    marginBottom: spacing.px12,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    paddingHorizontal: spacing.px8,
    paddingVertical: 0,
    margin: 0,
  },
  list: { maxHeight: 380 },
  listContent: { paddingBottom: spacing.px16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.px12,
    paddingHorizontal: spacing.px12,
    borderRadius: colors.radius.md,
  },
  rowActive: {
    backgroundColor: colors.primaryLight,
  },
  rowText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    paddingRight: spacing.px8,
  },
  rowTextActive: { color: colors.primary, fontWeight: "700" },
  empty: {
    paddingVertical: spacing.px24,
    alignItems: "center",
  },
  emptyText: { ...typography.caption, color: colors.gray },
});
