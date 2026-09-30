import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import BadgeCheck from "lucide-react-native/icons/badge-check";
import Star from "lucide-react-native/icons/star";

import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation/AppNavigator";
import {
  getProductReviews,
  getReviewEligibility,
  submitReview,
  type EligibleOrderItem,
  type ReviewPage,
} from "../services/reviewService";
import { formatDateTime } from "../utils/formatters";

type Props = NativeStackScreenProps<RootStackParamList, "Reviews">;

const EMPTY_PAGE: ReviewPage = {
  items: [],
  total: 0,
  average: 0,
  page: 1,
  limit: 20,
};

export default function ReviewsScreen({ navigation, route }: Props) {
  const { product } = route.params;
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState<ReviewPage>(EMPTY_PAGE);
  const [eligibleItems, setEligibleItems] = useState<EligibleOrderItem[]>([]);
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<number | string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const reviews = await getProductReviews(product.id);
      setPage(reviews);
      if (isAuthenticated) {
        const eligible = await getReviewEligibility(product.id);
        setEligibleItems(eligible);
        setSelectedOrderItemId((current) => current || eligible[0]?.order_item_id || null);
      } else {
        setEligibleItems([]);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được đánh giá.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, product.id]);

  useEffect(() => { void load(); }, [load]);

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
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Đánh giá sản phẩm" navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.summary}>
          <View>
            <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.variant}>{product.variantName}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.score}>{page.average ? page.average.toFixed(1) : "--"}</Text>
            <Text style={styles.total}>{page.total} đánh giá</Text>
          </View>
        </View>

        {eligibleItems.length > 0 ? (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Viết đánh giá</Text>
            {eligibleItems.length > 1 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.orderList}>
                {eligibleItems.map((item) => {
                  const selected = selectedOrderItemId === item.order_item_id;
                  return (
                    <Pressable
                      key={String(item.order_item_id)}
                      style={[styles.orderChip, selected && styles.orderChipSelected]}
                      onPress={() => setSelectedOrderItemId(item.order_item_id)}
                    >
                      <Text style={[styles.orderChipText, selected && styles.orderChipTextSelected]}>
                        {item.order_code}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : null}
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Pressable
                  key={value}
                  style={styles.starButton}
                  onPress={() => setRating(value)}
                  accessibilityRole="button"
                  accessibilityLabel={`${value} sao`}
                >
                  <Star
                    color={colors.accent}
                    fill={value <= rating ? colors.accent : "transparent"}
                    size={27}
                  />
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={2000}
              textAlignVertical="top"
              placeholder="Chia sẻ trải nghiệm sử dụng sản phẩm..."
              placeholderTextColor={colors.muted}
            />
            <Text style={styles.counter}>{comment.length}/2000</Text>
            <TouchableOpacity style={styles.submitButton} onPress={submit} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitText}>Gửi đánh giá</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Text style={styles.sectionTitle}>Đánh giá từ khách hàng</Text>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : page.items.length === 0 ? (
          <View style={styles.empty}>
            <Star color={colors.muted} size={30} />
            <Text style={styles.emptyTitle}>Chưa có đánh giá được duyệt</Text>
          </View>
        ) : (
          page.items.map((review) => (
            <View key={String(review.id)} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.reviewer}>{review.reviewer_name}</Text>
                {review.verified_purchase ? (
                  <View style={styles.verified}>
                    <BadgeCheck color={colors.green} size={14} />
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
                  />
                ))}
              </View>
              {review.comment ? <Text style={styles.comment}>{review.comment}</Text> : null}
              <Text style={styles.date}>{formatDateTime(review.created_at)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 36 },
  summary: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 14 },
  productName: { maxWidth: 230, color: colors.text, fontSize: 14, fontWeight: "900" },
  variant: { maxWidth: 230, color: colors.gray, fontSize: 11, marginTop: 5 },
  scoreBox: { alignItems: "center" },
  score: { color: colors.primary, fontSize: 24, fontWeight: "900" },
  total: { color: colors.gray, fontSize: 9, marginTop: 2 },
  formSection: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 14, marginTop: 14 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "900", marginTop: 18, marginBottom: 10 },
  orderList: { marginBottom: 8 },
  orderChip: { minHeight: 38, justifyContent: "center", borderColor: colors.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginRight: 8 },
  orderChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  orderChipText: { color: colors.gray, fontSize: 11, fontWeight: "700" },
  orderChipTextSelected: { color: colors.white },
  stars: { flexDirection: "row", marginVertical: 8 },
  starButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  commentInput: { minHeight: 110, color: colors.text, backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 12 },
  counter: { color: colors.muted, fontSize: 10, textAlign: "right", marginTop: 5 },
  submitButton: { minHeight: 48, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, borderRadius: 8, marginTop: 10 },
  submitText: { color: colors.white, fontSize: 13, fontWeight: "900" },
  message: { color: colors.primary, backgroundColor: colors.primaryLight, borderRadius: 8, padding: 11, marginTop: 12 },
  empty: { alignItems: "center", paddingVertical: 46 },
  emptyTitle: { color: colors.gray, fontSize: 13, fontWeight: "700", marginTop: 9 },
  reviewCard: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 10 },
  reviewTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reviewer: { color: colors.text, fontSize: 13, fontWeight: "900" },
  verified: { flexDirection: "row", alignItems: "center" },
  verifiedText: { color: colors.green, fontSize: 9, fontWeight: "800", marginLeft: 4 },
  smallStars: { flexDirection: "row", marginTop: 7 },
  comment: { color: colors.text, fontSize: 12, lineHeight: 19, marginTop: 8 },
  date: { color: colors.muted, fontSize: 9, marginTop: 8 },
});

