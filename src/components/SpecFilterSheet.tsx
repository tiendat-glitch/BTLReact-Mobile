// SpecFilterSheet — bộ lọc catalog dạng bottom sheet.
// Pattern tham khảo Shopee/Lazada/Tiki:
//   - Section chip ngắn (brand): wrap 2 cột tự nhiên.
//   - Section chip dài (CPU/RAM/SSD/GPU/screen/refreshRate): scroll ngang.
//   - Nút "Đặt lại" là icon ở header thay vì footer (tiết kiệm 56pt).
//   - Footer chỉ giữ "Áp dụng" fullWidth — CTA chính.
// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import RotateCcw from "lucide-react-native/icons/rotate-ccw";

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
  maxHeightRatio?: number;
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
  onToggle: (value: string) => void,
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

// Helper: facet group có dữ liệu để hiển thị hay không.
const hasGroup = (group: FacetGroup | undefined): boolean =>
  !!group && group.entries.length > 0;

export default function SpecFilterSheet({
  visible,
  facets,
  initial,
  onClose,
  onApply,
  maxHeightRatio,
}: Props) {
  const [draft, setDraft] = useState<SpecFilter>(initial);

  useEffect(() => {
    if (visible) {
      setDraft(initial);
    }
  }, [visible, initial]);

  const activeCount = countActiveFilterGroups(draft);
  const canReset = !isFilterEmpty(draft);

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
  const handleApply = () => onApply(draft);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Bộ lọc"
      maxHeightRatio={maxHeightRatio}
      headerRight={
        <View style={styles.headerRight}>
          <Pressable
            onPress={handleReset}
            disabled={!canReset}
            accessibilityRole="button"
            accessibilityLabel={
              activeCount > 0
                ? `Đặt lại bộ lọc (${activeCount} đang chọn)`
                : "Đặt lại bộ lọc"
            }
            hitSlop={6}
            style={({ pressed }) => [
              styles.resetIcon,
              !canReset && styles.resetIconDisabled,
              pressed && canReset ? styles.resetPressed : null,
            ]}
          >
            <RotateCcw
              color={canReset ? colors.textSubtle : colors.muted}
              size={16}
              strokeWidth={2}
            />
            {activeCount > 0 ? (
              <View style={styles.resetDot}>
                <Text style={styles.resetDotText}>{activeCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      }
      footer={
        <Button
          label={activeCount > 0 ? `Áp dụng (${activeCount})` : "Áp dụng"}
          variant="primary"
          size="sm"
          onPress={handleApply}
          fullWidth
        />
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <FilterSection title="Khoảng giá">
          <PriceRangeInput
            minValue={draft.priceMin}
            maxValue={draft.priceMax}
            onChange={updatePrice}
          />
        </FilterSection>

        {hasGroup(facets?.brand) || (draft.brand || []).length > 0 ? (
          <FilterSection
            title="Thương hiệu"
            selectedCount={(draft.brand || []).length}
          >
            {renderGroup(facets?.brand, draft.brand, updateList("brand"))}
          </FilterSection>
        ) : null}

        {hasGroup(facets?.cpu) || (draft.cpu || []).length > 0 ? (
          <FilterSection
            title="CPU"
            selectedCount={(draft.cpu || []).length}
            scroll
          >
            {renderGroup(facets?.cpu, draft.cpu, updateList("cpu"))}
          </FilterSection>
        ) : null}

        {hasGroup(facets?.ram) || (draft.ram || []).length > 0 ? (
          <FilterSection
            title="RAM"
            selectedCount={(draft.ram || []).length}
            scroll
          >
            {renderGroup(facets?.ram, draft.ram, updateList("ram"))}
          </FilterSection>
        ) : null}

        {hasGroup(facets?.storage) || (draft.storage || []).length > 0 ? (
          <FilterSection
            title="Ổ cứng / SSD"
            selectedCount={(draft.storage || []).length}
            scroll
          >
            {renderGroup(facets?.storage, draft.storage, updateList("storage"))}
          </FilterSection>
        ) : null}

        {hasGroup(facets?.gpu) || (draft.gpu || []).length > 0 ? (
          <FilterSection
            title="Card đồ hoạ (GPU)"
            selectedCount={(draft.gpu || []).length}
            scroll
          >
            {renderGroup(facets?.gpu, draft.gpu, updateList("gpu"))}
          </FilterSection>
        ) : null}

        {hasGroup(facets?.screenSize) || (draft.screenSize || []).length > 0 ? (
          <FilterSection
            title="Kích thước màn hình"
            selectedCount={(draft.screenSize || []).length}
            scroll
          >
            {renderGroup(
              facets?.screenSize,
              draft.screenSize,
              updateList("screenSize"),
            )}
          </FilterSection>
        ) : null}

        {hasGroup(facets?.refreshRate) ||
        (draft.refreshRate || []).length > 0 ? (
          <FilterSection
            title="Tần số quét"
            selectedCount={(draft.refreshRate || []).length}
            scroll
          >
            {renderGroup(
              facets?.refreshRate,
              draft.refreshRate,
              updateList("refreshRate"),
            )}
          </FilterSection>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.px8,
  },
  emptyHint: {
    ...typography.caption,
    color: colors.gray,
    paddingVertical: spacing.px4,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px4,
    marginRight: spacing.px2,
  },
  resetIcon: {
    width: 28,
    height: 28,
    borderRadius: colors.radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  resetDot: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 14,
    height: 14,
    paddingHorizontal: 3,
    borderRadius: 7,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  resetDotText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.white,
    lineHeight: 10,
  },
  resetIconDisabled: {
    opacity: 0.6,
  },
  resetPressed: { opacity: 0.7 },
});
