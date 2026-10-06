// ReviewSummaryInline — Khối rating summary gọn hiển thị trên ProductDetail.
// Lấy cảm hứng từ Shopee/Lazada: điểm trung bình, bar breakdown, CTA "Xem tất cả".
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Star from "lucide-react-native/icons/star";
import ChevronRight from "lucide-react-native/icons/chevron-right";

import Card from "./Card";
import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import { getProductReviews, type ReviewBreakdownEntry } from "../services/reviewService";

type Props = {
  productId: string | number;
  onViewAll: () => void;
};

const ratingColor = (level: number) => {
  if (level >= 4) return colors.success;
  if (level === 3) return colors.warning;
  return colors.danger;
};

const RatingBar = ({ entry }: { entry: ReviewBreakdownEntry }) => (
  <View style={styles.barRow} accessibilityLabel={`${entry.rating} sao ${entry.count} đánh giá`}>
    <View style={styles.barLabel}>
      <Text style={styles.barRating}>{entry.rating}</Text>
      <Star color={colors.accent} fill={colors.accent} size={10} strokeWidth={1.6} />
    </View>
    <View style={styles.bar}>
      <View
        style={[
          styles.barFill,
          {
            width: `${entry.percent}%`,
            backgroundColor: ratingColor(entry.rating),
          },
        ]}
      />
    </View>
  </View>
);

export default function ReviewSummaryInline({ productId, onViewAll }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [breakdown, setBreakdown] = useState<ReviewBreakdownEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!productId) {
      setIsLoading(false);
      return undefined;
    }
    setIsLoading(true);
    getProductReviews(String(productId), { limit: 1 })
      .then((data) => {
        if (cancelled) return;
        setAverage(Number(data.average || 0));
        setTotal(data.total || 0);
        setBreakdown(Array.isArray(data.breakdown) ? data.breakdown : []);
      })
      .catch(() => {
        if (cancelled) return;
        setAverage(0);
        setTotal(0);
        setBreakdown([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (isLoading) {
    return (
      <Card padding="md" style={styles.card}>
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.loadingText}>Đang tải đánh giá…</Text>
        </View>
      </Card>
    );
  }

  if (total === 0) {
    return (
      <Pressable onPress={onViewAll} accessibilityRole="button">
        <Card padding="md" style={styles.card}>
          <View style={styles.emptyRow}>
            <View style={styles.emptyIcon}>
              <Star color={colors.gray} size={20} strokeWidth={1.6} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.emptyTitle}>Chưa có đánh giá</Text>
              <Text style={styles.emptyText}>
                Trở thành người đầu tiên đánh giá sản phẩm này
              </Text>
            </View>
            <ChevronRight color={colors.gray} size={18} strokeWidth={2.2} />
          </View>
        </Card>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onViewAll} accessibilityRole="button">
      <Card padding="md" style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.left}>
            <Text style={styles.scoreBig}>
              {average.toFixed(1)}
              <Text style={styles.scoreMax}>/5</Text>
            </Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  color={value <= Math.round(average) ? colors.accent : colors.lightGray}
                  fill={value <= Math.round(average) ? colors.accent : "transparent"}
                  size={14}
                  strokeWidth={1.6}
                />
              ))}
            </View>
            <Text style={styles.totalText}>{total} đánh giá</Text>
          </View>
          <View style={styles.bars}>
            {breakdown.map((entry) => (
              <RatingBar key={entry.rating} entry={entry} />
            ))}
          </View>
        </View>
        <View style={styles.ctaRow}>
          <Text style={styles.ctaText}>Xem tất cả đánh giá</Text>
          <ChevronRight color={colors.primary} size={16} strokeWidth={2.2} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: spacing.px16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px16,
  },
  left: {
    alignItems: "center",
    minWidth: 86,
  },
  scoreBig: {
    ...typography.h1,
    color: colors.primary,
    fontSize: 36,
    lineHeight: 40,
  },
  scoreMax: {
    ...typography.body,
    color: colors.gray,
  },
  starRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
  },
  totalText: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 4,
  },
  bars: {
    flex: 1,
    gap: 4,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px8,
  },
  barLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    width: 20,
  },
  barRating: {
    ...typography.micro,
    color: colors.text,
    fontWeight: "700",
  },
  bar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: spacing.px12,
    paddingTop: spacing.px12,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  ctaText: {
    ...typography.captionStrong,
    color: colors.primary,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px8,
    paddingVertical: spacing.px8,
  },
  loadingText: {
    ...typography.caption,
    color: colors.gray,
  },
  emptyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px12,
  },
  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  emptyText: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
  },
});
