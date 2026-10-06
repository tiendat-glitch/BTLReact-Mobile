// @ts-nocheck
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
};

export default function ReviewsScreen({ navigation, route }) {
  const productId = (route.params as any)?.productId ?? (route.params as any)?.id ?? (route.params as any)?.product?.id;
  const cachedProduct = productId != null ? getCachedProduct(productId) : null;
  const [product, setProduct] = useState<any>(cachedProduct ?? (route.params as any)?.product ?? null);
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(EMPTY_PAGE);
  const [eligibleItems, setEligibleItems] = useState([]);
  const [selectedOrderItemId, setSelectedOrderItemId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Nếu điều hướng bằng productId (không có object product), fetch từ catalog.
  useEffect(() => {
    if (product || !productId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const result = await getCatalogPage({ page: 1, limit: 20, query: String(productId) });
        const match = result.items.find((entry) => String(entry.id) === String(productId));
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
      const reviews = await getProductReviews(product.id);
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
      setMessage(error instanceof Error ? error.message : "Không tải được đánh giá.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, product.id]);

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
      setMessage("Đánh giá đã được gửi và đang chờ duyệt.");
      const eligible = await getReviewEligibility(product.id);
      setEligibleItems(eligible);
      setSelectedOrderItemId(eligible[0]?.order_item_id || null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không gửi được đánh giá.");
    } finally {
      setIsSubmitting(false);
    }
    return;
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <ScreenHeader title="Đánh giá sản phẩm" navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card padding="md">
          <View style={styles.summary}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              <Text style={styles.variant}>{product.variantName}</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.score}>
                {page.average ? page.average.toFixed(1) : "--"}
              </Text>
              <Text style={styles.total}>{page.total} đánh giá</Text>
            </View>
          </View>
        </Card>

        {eligibleItems.length > 0 ? (
          <Card padding="md" style={styles.formSection}>
            <View style={styles.formHeader}>
              <Text style={styles.formEyebrow}>VIẾT ĐÁNH GIÁ</Text>
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
                    const selected = selectedOrderItemId === item.order_item_id;
                    return (
                      <Pressable
                        key={String(item.order_item_id)}
                        style={[
                          styles.orderChip,
                          selected && styles.orderChipSelected,
                        ]}
                        onPress={() => setSelectedOrderItemId(item.order_item_id)}
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
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((value) => {
                const active = value <= rating;
                return (
                  <Pressable
                    key={value}
                    style={styles.starButton}
                    onPress={() => setRating(value)}
                    accessibilityRole="button"
                    accessibilityLabel={`${value} sao`}
                    accessibilityState={{ selected: active }}
                  >
                    <Star
                      color={active ? colors.accent : colors.borderStrong}
                      fill={active ? colors.accent : "transparent"}
                      size={32}
                      strokeWidth={1.6}
                    />
                  </Pressable>
                );
              })}
              <Text style={styles.ratingLabel}>
                {["Rất tệ", "Tệ", "Tạm ổn", "Tốt", "Tuyệt vời"][rating - 1]}
              </Text>
            </View>

            <Text style={styles.fieldLabel}>Nhận xét chi tiết</Text>
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
              <Text style={styles.noFormTitle}>
                Chỉ khách đã mua mới có thể đánh giá
              </Text>
              <Text style={styles.noFormText}>
                Mua sản phẩm này để chia sẻ trải nghiệm và giúp người dùng
                khác chọn đúng sản phẩm.
              </Text>
            </View>
          </Card>
        ) : null}

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Text style={styles.sectionTitle}>Đánh giá từ khách hàng</Text>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : page.items.length === 0 ? (
          <FeedbackState
            variant="empty"
            title="Chưa có đánh giá được duyệt"
            description="Hãy là người đầu tiên chia sẻ trải nghiệm."
            icon={<Inbox color={colors.muted} size={32} strokeWidth={1.6} />}
          />
        ) : (
          page.items.map((review) => (
            <Card key={String(review.id)} padding="md" style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.reviewer}>{review.reviewer_name}</Text>
                {review.verified_purchase ? (
                  <View style={styles.verified}>
                    <BadgeCheck color={colors.green} size={14} strokeWidth={2.2} />
                    <Text style={styles.verifiedText}>Đã mua hàng</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.smallStars}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    color={colors.accent}
                    fill={value <= review.rating ? colors.accent : "transparent"}
                    size={14}
                    strokeWidth={1.8}
                  />
                ))}
              </View>
              {review.comment ? (
                <Text style={styles.comment}>{review.comment}</Text>
              ) : null}
              <Text style={styles.date}>{formatDateTime(review.created_at)}</Text>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.px16, paddingBottom: spacing.px32 },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productName: {
    ...typography.bodyStrong,
    color: colors.text,
    maxWidth: 230,
  },
  variant: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 5,
    maxWidth: 230,
  },
  scoreBox: { alignItems: "center" },
  score: {
    ...typography.h1,
    color: colors.primary,
  },
  total: {
    ...typography.micro,
    color: colors.gray,
    marginTop: 2,
  },
  formSection: { marginTop: spacing.px14 },
  formHeader: { marginBottom: spacing.px12 },
  formEyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
    marginBottom: 4,
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
  orderChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  orderChipText: {
    ...typography.captionStrong,
    color: colors.gray,
  },
  orderChipTextSelected: { color: colors.white },
  stars: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.px4,
    marginBottom: spacing.px4,
  },
  starButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingLabel: {
    ...typography.captionStrong,
    color: colors.accent,
    marginLeft: spacing.px8,
  },
  commentInput: {
    minHeight: 120,
    color: colors.text,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    ...typography.body,
  },
  counter: {
    ...typography.micro,
    color: colors.muted,
    textAlign: "right",
    marginTop: spacing.px4,
    marginBottom: spacing.px12,
  },
  noForm: { paddingVertical: spacing.px8 },
  noFormTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  noFormText: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 4,
    lineHeight: 18,
  },
  message: {
    ...typography.captionStrong,
    color: colors.success,
    backgroundColor: colors.successLight,
    borderColor: colors.successSoft,
    borderWidth: 1,
    borderRadius: colors.radius.md,
    padding: spacing.px12,
    marginTop: spacing.px12,
  },
  reviewCard: { marginBottom: spacing.px10 },
  reviewTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewer: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  verified: { flexDirection: "row", alignItems: "center" },
  verifiedText: {
    ...typography.micro,
    color: colors.green,
    marginLeft: 4,
  },
  smallStars: { flexDirection: "row", marginTop: 7 },
  comment: {
    ...typography.small,
    color: colors.text,
    lineHeight: 19,
    marginTop: spacing.px8,
  },
  date: {
    ...typography.micro,
    color: colors.muted,
    marginTop: spacing.px8,
  },
});