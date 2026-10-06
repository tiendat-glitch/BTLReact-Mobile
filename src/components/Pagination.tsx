// Pagination — thanh phân trang 1, 2, 3... cho catalog mobile. Hỗ trợ rút gọn
// khi nhiều trang: hiện trang hiện tại, 2 trang trước/sau, và nút "Xem thêm"
// thay vì nhảy số lớn.
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import ChevronRight from "lucide-react-native/icons/chevron-right";

import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  isLoading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  /** Tổng số item hiện đang hiển thị (để hiện "Xem thêm (N còn lại)") */
  remainingHint?: number;
};

const computePageWindow = (
  current: number,
  total: number,
  radius: number = 1,
): Array<number | "…"> => {
  if (total <= 1) return [];
  const set = new Set<number>([1, total]);
  for (let i = current - radius; i <= current + radius; i += 1) {
    if (i >= 1 && i <= total) set.add(i);
  }
  const sorted = Array.from(set).sort((a, b) => a - b);
  const result: Array<number | "…"> = [];
  let previous = 0;
  for (const value of sorted) {
    if (value - previous > 1) result.push("…");
    result.push(value);
    previous = value;
  }
  return result;
};

export default function Pagination({
  page,
  totalPages,
  onChange,
  isLoading = false,
  hasNextPage = false,
  onLoadMore,
  remainingHint,
}: Props) {
  const window = useMemo(
    () => computePageWindow(page, totalPages, 1),
    [page, totalPages],
  );

  const safeTotal = Math.max(1, totalPages);
  const canPrev = page > 1 && !isLoading;
  const canNext = page < safeTotal && !isLoading;

  if (safeTotal <= 1 && !hasNextPage) return null;

  return (
    <View style={styles.wrapper} accessibilityRole="none">
      <View style={styles.row}>
        <Pressable
          onPress={() => canPrev && onChange(page - 1)}
          disabled={!canPrev}
          accessibilityRole="button"
          accessibilityLabel="Trang trước"
          hitSlop={8}
          style={({ pressed }) => [
            styles.navButton,
            !canPrev ? styles.navButtonDisabled : null,
            pressed && canPrev ? styles.pressed : null,
          ]}
        >
          <ChevronLeft
            color={canPrev ? colors.primary : colors.muted}
            size={18}
            strokeWidth={2.4}
          />
        </Pressable>

        <View style={styles.pagesRow} accessibilityRole="tablist">
          {window.map((value, index) =>
            value === "…" ? (
              <View
                key={`gap-${index}`}
                style={styles.gap}
                accessibilityElementsHidden
              >
                <Text style={styles.gapText}>…</Text>
              </View>
            ) : (
              <Pressable
                key={value}
                onPress={() => !isLoading && onChange(value)}
                disabled={isLoading}
                accessibilityRole="tab"
                accessibilityState={{ selected: value === page }}
                accessibilityLabel={`Trang ${value}`}
                style={({ pressed }) => [
                  styles.pageButton,
                  value === page ? styles.pageButtonActive : null,
                  pressed && value !== page ? styles.pressed : null,
                ]}
              >
                <Text
                  style={[
                    styles.pageText,
                    value === page ? styles.pageTextActive : null,
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            ),
          )}
        </View>

        <Pressable
          onPress={() => canNext && onChange(page + 1)}
          disabled={!canNext}
          accessibilityRole="button"
          accessibilityLabel="Trang sau"
          hitSlop={8}
          style={({ pressed }) => [
            styles.navButton,
            !canNext ? styles.navButtonDisabled : null,
            pressed && canNext ? styles.pressed : null,
          ]}
        >
          <ChevronRight
            color={canNext ? colors.primary : colors.muted}
            size={18}
            strokeWidth={2.4}
          />
        </Pressable>
      </View>

      {onLoadMore && hasNextPage ? (
        <Pressable
          onPress={onLoadMore}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="Xem thêm sản phẩm"
          style={({ pressed }) => [
            styles.loadMore,
            pressed && !isLoading ? styles.pressed : null,
            isLoading ? styles.loadMoreDisabled : null,
          ]}
        >
          <Text style={styles.loadMoreText}>
            {isLoading
              ? "Đang tải…"
              : remainingHint
                ? `Xem thêm (${remainingHint} sản phẩm)`
                : "Xem thêm sản phẩm"}
          </Text>
          {!isLoading ? (
            <ChevronRight
              color={colors.white}
              size={16}
              strokeWidth={2.4}
            />
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.px16,
    gap: spacing.px12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.px8,
  },
  pagesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px4,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: colors.radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  navButtonDisabled: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  pageButton: {
    minWidth: 36,
    height: 36,
    borderRadius: colors.radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.px8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pageButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pageText: {
    ...typography.captionStrong,
    color: colors.text,
  },
  pageTextActive: {
    color: colors.white,
  },
  gap: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  gapText: {
    ...typography.captionStrong,
    color: colors.muted,
  },
  loadMore: {
    minHeight: 48,
    borderRadius: colors.radius.lg,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.px8,
    paddingHorizontal: spacing.px20,
  },
  loadMoreText: {
    ...typography.button,
    color: colors.white,
  },
  loadMoreDisabled: { opacity: 0.6 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
