// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import BottomSheet from "./BottomSheet";
import Button from "./Button";
import FilterChip from "./FilterChip";
import FilterSection from "./FilterSection";
import PriceRangeInput from "./PriceRangeInput";
import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import type { CatalogFacets, FacetGroup, SpecFilter } from "../types/specFilter";
import {
  EMPTY_FILTER,
  countActiveFilterGroups,
  isFilterEmpty,
} from "../types/specFilter";

type Props = {
  visible: boolean;
  facets: CatalogFacets | null;
  initial: SpecFilter;
  onClose: () => void;
  onApply: (next: SpecFilter) => void;
};

const toggleValue = (list: string[] | undefined, value: string): string[] => {
  const current = list || [];
  if (current.includes(value)) {
    return current.filter((item) => item !== value);
  }
  return [...current, value];
};

const renderGroup = (
  group: FacetGroup | undefined,
  selected: string[] | undefined,
  onToggle: (value: string) => void
) => {
  if (!group || group.entries.length === 0) {
    return (
      <Text style={styles.emptyHint}>
        Không có giá trị nào cho bộ lọc này.
      </Text>
    );
  }
  return group.entries.map((entry) => {
    const active = (selected || []).includes(entry.value);
    return (
      <FilterChip
        key={`${group.key}-${entry.value}`}
        label={entry.value}
        count={entry.count}
        selected={active}
        onPress={() => onToggle(entry.value)}
      />
    );
  });
};

export default function SpecFilterSheet({
  visible,
  facets,
  initial,
  onClose,
  onApply,
}: Props) {
  const [draft, setDraft] = useState<SpecFilter>(initial);

  useEffect(() => {
    if (visible) {
      setDraft(initial);
    }
  }, [visible, initial]);

  const activeCount = countActiveFilterGroups(draft);

  const updateList = (key: keyof SpecFilter) => (value: string) => {
    setDraft((current) => ({
      ...current,
      [key]: toggleValue(current[key] as string[] | undefined, value),
    }));
  };

  const updatePrice = (next: { min: number | null; max: number | null }) => {
    setDraft((current) => ({
      ...current,
      priceMin: next.min,
      priceMax: next.max,
    }));
  };

  const handleReset = () => setDraft(EMPTY_FILTER);

  const handleApply = () => {
    onApply(draft);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Bộ lọc"
      headerRight={
        activeCount > 0 ? (
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>{activeCount}</Text>
          </View>
        ) : null
      }
      footer={
        <View style={styles.footerRow}>
          <Pressable
            onPress={handleReset}
            disabled={isFilterEmpty(draft)}
            accessibilityRole="button"
            accessibilityLabel="Đặt lại bộ lọc"
            hitSlop={8}
            style={({ pressed }) => [
              styles.resetBtn,
              pressed ? styles.resetPressed : null,
            ]}
          >
            <Text
              style={[
                styles.resetText,
                isFilterEmpty(draft) && styles.resetDisabled,
              ]}
            >
              Đặt lại
            </Text>
          </Pressable>
          <View style={styles.applyWrap}>
            <Button label="Áp dụng" variant="primary" onPress={handleApply} fullWidth />
          </View>
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <FilterSection title="Khoảng giá" description="Đơn vị: VNĐ">
          <PriceRangeInput
            minValue={draft.priceMin}
            maxValue={draft.priceMax}
            onChange={updatePrice}
          />
        </FilterSection>

        <FilterSection
          title="Thương hiệu"
          selectedCount={(draft.brand || []).length}
        >
          {renderGroup(facets?.brand, draft.brand, updateList("brand"))}
        </FilterSection>

        <FilterSection title="CPU" selectedCount={(draft.cpu || []).length}>
          {renderGroup(facets?.cpu, draft.cpu, updateList("cpu"))}
        </FilterSection>

        <FilterSection title="RAM" selectedCount={(draft.ram || []).length}>
          {renderGroup(facets?.ram, draft.ram, updateList("ram"))}
        </FilterSection>

        <FilterSection
          title="Ổ cứng / SSD"
          selectedCount={(draft.storage || []).length}
        >
          {renderGroup(facets?.storage, draft.storage, updateList("storage"))}
        </FilterSection>

        <FilterSection
          title="Card đồ hoạ (GPU)"
          selectedCount={(draft.gpu || []).length}
        >
          {renderGroup(facets?.gpu, draft.gpu, updateList("gpu"))}
        </FilterSection>

        <FilterSection
          title="Kích thước màn hình"
          selectedCount={(draft.screenSize || []).length}
        >
          {renderGroup(
            facets?.screenSize,
            draft.screenSize,
            updateList("screenSize")
          )}
        </FilterSection>

        <FilterSection
          title="Tần số quét"
          selectedCount={(draft.refreshRate || []).length}
        >
          {renderGroup(
            facets?.refreshRate,
            draft.refreshRate,
            updateList("refreshRate")
          )}
        </FilterSection>

        <View style={styles.bottomGap} />
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  emptyHint: {
    ...typography.caption,
    color: colors.gray,
    paddingVertical: spacing.px8,
  },
  activePill: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: colors.radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  activePillText: {
    ...typography.captionStrong,
    color: colors.white,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px12,
  },
  resetBtn: {
    paddingVertical: spacing.px8,
    paddingHorizontal: spacing.px8,
  },
  resetPressed: { opacity: 0.6 },
  resetText: {
    ...typography.bodyStrong,
    color: colors.textSubtle,
  },
  resetDisabled: { color: colors.muted },
  applyWrap: { flex: 1 },
  bottomGap: { height: spacing.px16 },
});
