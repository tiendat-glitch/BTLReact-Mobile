// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BadgeCheck from "lucide-react-native/icons/badge-check";
import Send from "lucide-react-native/icons/send";
import Star from "lucide-react-native/icons/star";
import Inbox from "lucide-react-native/icons/inbox";
import Sparkles from "lucide-react-native/icons/sparkles";

import Button from "../components/Button";
import Card from "../components/Card";
import FeedbackState from "../components/FeedbackState";
import ScreenHeader from "../components/ScreenHeader";
import StatusBadge from "../components/StatusBadge";
import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import { useAuth } from "../context/AuthContext";
import {
  getProductReviews,
  getReviewEligibility,
  submitReview,
  type ReviewBreakdownEntry,
} from "../services/reviewService";
import { getCatalogPage } from "../services/catalogApiService";
import { getCachedProduct } from "../services/productCache";
import { formatDateTime } from "../utils/formatters";

const EMPTY_PAGE = {
  items: [],
  total: 0,
  average: 0,
  page: 1,
  limit: 20,
  breakdown: [],
};

const RATING_EMOJI = ["😡", "😕", "😐", "😊", "😍"];
const RATING_LABEL = ["Rất tệ", "Tệ", "Tạm ổn", "Tốt", "Tuyệt vời"];

const initials = (name) => {
  if (!name) return "KH";
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

// Map màu tương ứng từng mức rating cho breakdown bar.
const ratingColor = (level) => {
  if (level >= 4) return colors.success;
  if (level === 3) return colors.warning;
  return colors.danger;
};

export default function ReviewsScreen({ navigation, route }) {
  const productId =
    (route.params as any)?.productId ??
    (route.params as any)?.id ??
    (route.params as any)?.product?.id;
  const cachedProduct =
    productId != null ? getCachedProduct(productId) : null;
  const [product, setProduct] = useState<any>(
    cachedProduct ?? (route.params as any)?.product ?? null,
  );
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(EMPTY_PAGE);
  const [eligibleItems, setEligibleItems] = useState([]);
  const [selectedOrderItemId, setSelectedOrderItemId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  /** Filter rating đang chọn: null = tất cả, 1..5 = lọc theo mức sao. */
  const [filterRating, setFilterRating] = useState(null);

  useEffect(() => {
    if (product || !productId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const result = await getCatalogPage({
          page: 1,
          limit: 20,
          query: String(productId),
        });
        const match = result.items.find(
          (entry) => String(entry.id) === String(productId),
        );
        if (!cancelled && match) setProduct(match);
      } catch {
        // ignore — UI sẽ hiển thị khi product null
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, product]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const reviews = await getProductReviews(product.id, {
        rating: filterRating ?? undefined,
      });
      setPage(reviews);
      if (isAuthenticated) {
        const eligible = await getReviewEligibility(product.id);
        setEligibleItems(eligible);
        setSelectedOrderItemId(
          (current) => current || eligible[0]?.order_item_id || null,
        );
      } else {
        setEligibleItems([]);
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không tải được đánh giá.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, product.id, filterRating]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    if (!selectedOrderItemId) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      await submitReview(product.id, {
        orderItemId: selectedOrderItemId,
        rating,
        comment: comment.trim(),
      });
      setComment("");
      setRating(5);
      setMessage("Đánh giá đã được gửi và đang chờ duyệt.");
      const eligible = await getReviewEligibility(product.id);
      setEligibleItems(eligible);
      setSelectedOrderItemId(eligible[0]?.order_item_id || null);
      // Reload lại list để user thấy breakdown cập nhật.
      const reviews = await getProductReviews(product.id, {
        rating: filterRating ?? undefined,
      });
      setPage(reviews);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không gửi được đánh giá.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const breakdown: ReviewBreakdownEntry[] = useMemo(() => {
    return Array.isArray(page.breakdown) ? page.breakdown : [];
  }, [page.breakdown]);

  const totalReviews = page.total || 0;
  const average = Number(page.average || 0);
  const productThumb =
    product?.imageUrl ||
    (Array.isArray(product?.images) && product.images[0]) ||
    null;
  const productName = product?.name || "Sản phẩm";
  const productVariant = product?.variantName || product?.brand || "";

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <ScreenHeader title="Đánh giá sản phẩm" navigation={navigation} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ========== Hero: rating trung bình + breakdown ========== */}
        <Card padding="lg" style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroProduct}>
              {productThumb ? (
                <Image
                  source={{ uri: productThumb }}
                  style={styles.heroThumb}
                  accessibilityLabel={`Ảnh sản phẩm ${productName}`}
                />
              ) : (
                <View style={[styles.heroThumb, styles.heroThumbFallback]}>
                  <Text style={styles.heroThumbFallbackText}>
                    {productName?.[0]?.toUpperCase() || "S"}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.heroName} numberOfLines={2}>
                  {productName}
                </Text>
                {productVariant ? (
                  <Text style={styles.heroVariant} numberOfLines={1}>
                    {productVariant}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={styles.heroScore}>
              <Text style={styles.heroScoreValue}>
                {totalReviews > 0 ? average.toFixed(1) : "—"}
                <Text style={styles.heroScoreMax}> /5</Text>
              </Text>
              <View style={styles.heroStarsRow}>
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
              <Text style={styles.heroTotal}>
                {totalReviews > 0
                  ? `${totalReviews} đánh giá`
                  : "Chưa có đánh giá"}
              </Text>
            </View>
          </View>

          {totalReviews > 0 ? (
            <View style={styles.breakdown}>
              {breakdown.map((entry) => (
                <View
                  key={entry.rating}
                  style={styles.breakdownRow}
                  accessibilityLabel={`${entry.rating} sao: ${entry.count} đánh giá, ${entry.percent}%`}
                >
                  <View style={styles.breakdownLabel}>
                    <Text style={styles.breakdownRating}>{entry.rating}</Text>
                    <Star
                      color={colors.accent}
                      fill={colors.accent}
                      size={11}
                      strokeWidth={1.6}
                    />
                </View>
                  <View style={styles.breakdownBar}>
                    <View
                      style={[
                        styles.breakdownFill,
                        {
                          width: `${entry.percent}%`,
                          backgroundColor: ratingColor(entry.rating),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.breakdownCount}>{entry.count}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </Card>

        {/* ========== Form viết đánh giá ========== */}
        {eligibleItems.length > 0 ? (
          <Card padding="lg" style={styles.formSection}>
            <View style={styles.formHeader}>
              <View style={styles.formHeaderLeft}>
                <Sparkles
                  color={colors.primary}
                  size={16}
                  strokeWidth={2.2}
                />
                <Text style={styles.formEyebrow}>VIẾT ĐÁNH GIÁ</Text>
              </View>
              <Text style={styles.formTitle}>
                Chia sẻ trải nghiệm của bạn
              </Text>
              <Text style={styles.formDescription}>
                Đánh giá giúp người dùng khác chọn được sản phẩm phù hợp.
              </Text>
            </View>
            {eligibleItems.length > 1 ? (
              <>
                <Text style={styles.fieldLabel}>Đơn hàng của bạn</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.orderList}
                >
                  {eligibleItems.map((item) => {
                    const selected =
                      selectedOrderItemId === item.order_item_id;
                    return (
                      <Pressable
                        key={String(item.order_item_id)}
                        style={[
                          styles.orderChip,
                          selected && styles.orderChipSelected,
                        ]}
                        onPress={() =>
                          setSelectedOrderItemId(item.order_item_id)
                        }
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        accessibilityLabel={`Đánh giá cho đơn ${item.order_code}`}
                      >
                        <Text
                          style={[
                            styles.orderChipText,
                            selected && styles.orderChipTextSelected,
                          ]}
                        >
                          {item.order_code}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </>
            ) : null}

            <Text style={styles.fieldLabel}>Mức độ hài lòng</Text>
            <View style={styles.starPicker}>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((value) => {
                  const active = value <= rating;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => setRating(value)}
                      accessibilityRole="button"
                      accessibilityLabel={`${value} sao`}
                      accessibilityState={{ selected: active }}
                      hitSlop={6}
                      style={({ pressed }) => [
                        styles.starButton,
                        pressed ? styles.pressed : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.starEmoji,
                          { opacity: active ? 1 : 0.35 },
                        ]}
                      >
                        {RATING_EMOJI[value - 1]}
                      </Text>
                      <Star
                        color={active ? colors.accent : colors.borderStrong}
                        fill={active ? colors.accent : "transparent"}
                        size={28}
                        strokeWidth={1.6}
                      />
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.ratingFeedback}>
                <Text style={styles.ratingEmoji}>{RATING_EMOJI[rating - 1]}</Text>
                <Text style={styles.ratingLabel}>{RATING_LABEL[rating - 1]}</Text>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Nhận xét chi tiết</Text>
            <View style={styles.commentBox}>
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                multiline
                maxLength={2000}
                textAlignVertical="top"
                placeholder="Sản phẩm dùng có ổn không? Ưu/nhược điểm? Có đáng tiền không?"
                placeholderTextColor={colors.muted}
                accessibilityLabel="Nhận xét chi tiết"
              />
              <Text style={styles.counter}>{comment.length}/2000</Text>
            </View>

            <Button
              label="Gửi đánh giá"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              fullWidth
              leadingIcon={(color) => (
                <Send color={color} size={18} strokeWidth={2.4} />
              )}
              onPress={submit}
              disabled={!selectedOrderItemId}
            />
          </Card>
        ) : isAuthenticated ? (
          <Card padding="md" style={styles.formSection}>
            <View style={styles.noForm}>
              <View style={styles.noFormIcon}>
                <Star color={colors.muted} size={22} strokeWidth={1.6} />
              </View>
              <Text style={styles.noFormTitle}>
                Chưa có đơn hàng đủ điều kiện đánh giá
              </Text>
              <Text style={styles.noFormText}>
                Bạn chỉ có thể đánh giá sau khi đơn hàng ở trạng thái Đã giao / Hoàn tất. Mỗi sản phẩm trong đơn chỉ đánh giá được một lần.
              </Text>
              <Button
                label="Xem đơn hàng của tôi"
                variant="tonal"
                size="sm"
                fullWidth={false}
                onPress={() => navigation.navigate("Orders")}
                style={styles.noFormButton}
              />
            </View>
          </Card>
        ) : (
          <Card padding="md" style={styles.formSection}>
            <View style={styles.noForm}>
              <View style={styles.noFormIcon}>
                <Star color={colors.muted} size={22} strokeWidth={1.6} />
              </View>
              <Text style={styles.noFormTitle}>
                Đăng nhập để viết đánh giá
              </Text>
              <Text style={styles.noFormText}>
                Chỉ khách hàng đã mua sản phẩm mới có thể chia sẻ trải nghiệm.
              </Text>
              <Button
                label="Đăng nhập"
                variant="primary"
                size="sm"
                fullWidth={false}
                onPress={() =>
                  navigation.navigate("Login", {
                    redirectTo: "Reviews",
                    productId,
                  })
                }
                style={styles.noFormButton}
              />
            </View>
          </Card>
        )}

        {message ? (
          <View
            style={[
              styles.message,
              message.startsWith("Đánh giá đã")
                ? styles.messageSuccess
                : styles.messageError,
            ]}
            accessibilityLiveRegion="polite"
          >
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ) : null}

        {/* ========== Danh sách review ========== */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            Đánh giá từ khách hàng{" "}
            <Text style={styles.sectionTitleCount}>({totalReviews})</Text>
          </Text>
        </View>

        {totalReviews > 0 ? (
          <View style={styles.filterRow} accessibilityRole="tablist">
            <FilterChipButton
              label="Tất cả"
              count={totalReviews}
              active={filterRating === null}
              onPress={() => setFilterRating(null)}
            />
            {breakdown
              .filter((entry) => entry.count > 0)
              .map((entry) => (
                <FilterChipButton
                  key={entry.rating}
                  label={`${entry.rating} ★`}
                  count={entry.count}
                  active={filterRating === entry.rating}
                  onPress={() => setFilterRating(entry.rating)}
                />
              ))}
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải đánh giá…</Text>
          </View>
        ) : page.items.length === 0 ? (
          <FeedbackState
            variant="empty"
            title={
              filterRating
                ? `Chưa có đánh giá ${filterRating} sao`
                : "Chưa có đánh giá được duyệt"
            }
            description={
              filterRating
                ? "Hãy thử lọc theo mức sao khác hoặc là người đầu tiên."
                : "Hãy là người đầu tiên chia sẻ trải nghiệm."
            }
            icon={
              <Inbox color={colors.muted} size={32} strokeWidth={1.6} />
            }
          />
        ) : (
          page.items.map((review) => (
            <ReviewItem
              key={String(review.id)}
              review={review}
              productThumb={productThumb}
              productName={productName}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ========== Sub-components ==========

function FilterChipButton({ label, count, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        active && styles.filterChipActive,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`Lọc ${label}, ${count} đánh giá`}
    >
      <Text
        style={[
          styles.filterChipText,
          active && styles.filterChipTextActive,
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.filterChipCount,
          active && styles.filterChipCountActive,
        ]}
      >
        <Text
          style={[
            styles.filterChipCountText,
            active && styles.filterChipCountTextActive,
          ]}
        >
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

function ReviewItem({ review, productThumb, productName }) {
  const name = review.reviewer_name || "Khách hàng";
  const verified =
    review.verified_purchase === true || review.verified_purchase === 1;
  return (
    <Card padding="md" style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.reviewerRow}>
            <Text style={styles.reviewer} numberOfLines={1}>
              {name}
            </Text>
            {verified ? (
              <View style={styles.verified}>
                <BadgeCheck
                  color={colors.success}
                  size={13}
                  strokeWidth={2.4}
                />
                <Text style={styles.verifiedText}>Đã mua hàng</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.reviewMeta}>
            <View style={styles.smallStars}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  color={colors.accent}
                  fill={
                    value <= review.rating ? colors.accent : "transparent"
                  }
                  size={13}
                  strokeWidth={1.8}
                />
              ))}
            </View>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.date}>
              {formatDateTime(review.created_at)}
            </Text>
          </View>
        </View>
        {productThumb ? (
          <Image
            source={{ uri: productThumb }}
            style={styles.reviewThumb}
            accessibilityLabel={`Ảnh sản phẩm ${productName}`}
          />
        ) : null}
      </View>
      {review.comment ? (
        <Text style={styles.comment}>{review.comment}</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.px16, paddingBottom: spacing.px32 },
  pressed: { opacity: 0.7 },

  // ===== Hero summary =====
  heroCard: { marginBottom: spacing.px12 },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px12,
  },
  heroProduct: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px12,
  },
  heroThumb: {
    width: 56,
    height: 56,
    borderRadius: colors.radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  heroThumbFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  heroThumbFallbackText: {
    ...typography.h3,
    color: colors.primary,
  },
  heroName: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  heroVariant: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
  },
  heroScore: {
    alignItems: "flex-end",
    minWidth: 86,
  },
  heroScoreValue: {
    ...typography.h1,
    color: colors.primary,
  },
  heroScoreMax: {
    ...typography.body,
    color: colors.gray,
  },
  heroStarsRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 2,
  },
  heroTotal: {
    ...typography.micro,
    color: colors.gray,
    marginTop: 2,
  },

  breakdown: {
    marginTop: spacing.px16,
    paddingTop: spacing.px12,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.px6,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px8,
  },
  breakdownLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    width: 24,
  },
  breakdownRating: {
    ...typography.captionStrong,
    color: colors.text,
  },
  breakdownBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
  },
  breakdownFill: {
    height: "100%",
    borderRadius: 3,
  },
  breakdownCount: {
    ...typography.caption,
    color: colors.gray,
    width: 32,
    textAlign: "right",
  },

  // ===== Form =====
  formSection: { marginTop: spacing.px8 },
  formHeader: { marginBottom: spacing.px16 },
  formHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  formEyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
  },
  formTitle: {
    ...typography.h3,
    color: colors.text,
  },
  formDescription: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 4,
    lineHeight: 18,
  },
  fieldLabel: {
    ...typography.captionStrong,
    color: colors.textSubtle,
    marginTop: spacing.px14,
    marginBottom: spacing.px8,
  },
  orderList: { gap: spacing.px8, paddingRight: spacing.px8 },
  orderChip: {
    minHeight: 40,
    justifyContent: "center",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.px14,
  },
  orderChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  orderChipText: {
    ...typography.captionStrong,
    color: colors.gray,
  },
  orderChipTextSelected: { color: colors.white },

  // ===== Star picker =====
  starPicker: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: colors.radius.md,
    paddingVertical: spacing.px16,
    alignItems: "center",
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.px4,
  },
  starButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  starEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  ratingFeedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px8,
    marginTop: spacing.px8,
  },
  ratingEmoji: {
    fontSize: 22,
  },
  ratingLabel: {
    ...typography.bodyStrong,
    color: colors.accent,
  },

  // ===== Comment =====
  commentBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    backgroundColor: colors.surface,
    padding: spacing.px12,
  },
  commentInput: {
    minHeight: 110,
    color: colors.text,
    ...typography.body,
    padding: 0,
    margin: 0,
  },
  counter: {
    ...typography.micro,
    color: colors.muted,
    textAlign: "right",
    marginTop: spacing.px8,
  },

  // ===== No form state =====
  noForm: {
    alignItems: "center",
    paddingVertical: spacing.px12,
    gap: spacing.px8,
  },
  noFormIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  noFormTitle: {
    ...typography.bodyStrong,
    color: colors.text,
    textAlign: "center",
  },
  noFormText: {
    ...typography.caption,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 18,
  },
  noFormHighlight: {
    color: colors.text,
    fontWeight: "700",
  },
  noFormButton: {
    marginTop: spacing.px8,
  },

  // ===== Message =====
  message: {
    ...typography.captionStrong,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    marginTop: spacing.px12,
  },
  messageSuccess: {
    color: colors.success,
    backgroundColor: colors.successLight,
    borderColor: colors.successSoft,
    borderWidth: 1,
  },
  messageError: {
    color: colors.danger,
    backgroundColor: colors.dangerLight,
    borderColor: colors.dangerSoft,
    borderWidth: 1,
  },
  messageText: {
    ...typography.captionStrong,
  },

  // ===== List =====
  listHeader: {
    marginTop: spacing.px20,
    marginBottom: spacing.px12,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
  },
  sectionTitleCount: {
    ...typography.body,
    color: colors.gray,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.px8,
    marginBottom: spacing.px12,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.px12,
    paddingVertical: 7,
    borderRadius: colors.radius.pill,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.captionStrong,
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  filterChipCount: {
    minWidth: 20,
    paddingHorizontal: 5,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipCountActive: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  filterChipCountText: {
    ...typography.micro,
    color: colors.gray,
    fontWeight: "700",
  },
  filterChipCountTextActive: {
    color: colors.white,
  },

  // ===== Review item =====
  reviewCard: { marginBottom: spacing.px10 },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.px12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...typography.captionStrong,
    color: colors.primary,
  },
  reviewerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px8,
  },
  reviewer: {
    ...typography.bodyStrong,
    color: colors.text,
    flexShrink: 1,
  },
  verified: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.successLight,
    borderRadius: colors.radius.xs,
  },
  verifiedText: {
    ...typography.micro,
    color: colors.success,
    fontWeight: "700",
  },
  reviewMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  smallStars: { flexDirection: "row", gap: 1 },
  dot: {
    ...typography.caption,
    color: colors.lightGray,
  },
  date: {
    ...typography.caption,
    color: colors.gray,
  },
  reviewThumb: {
    width: 36,
    height: 36,
    borderRadius: colors.radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  comment: {
    ...typography.small,
    color: colors.text,
    lineHeight: 20,
    marginTop: spacing.px10,
  },

  // ===== Loading =====
  loadingWrap: {
    alignItems: "center",
    paddingVertical: spacing.px24,
    gap: spacing.px8,
  },
  loadingText: {
    ...typography.caption,
    color: colors.gray,
  },
});
