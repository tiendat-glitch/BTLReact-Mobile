// PromotionCarousel — banner ngang có snap, hero gradient + eyebrow + title.
// Dùng cho Home và Catalog.
import React from "react";
import {
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import ArrowRight from "lucide-react-native/icons/arrow-right";

import colors from "../constants/colors";
import shadows from "../constants/shadows";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import type { Promotion } from "../services/promotionService";

type Props = {
  promotions: Promotion[];
  onPress: (promotion: Promotion) => void;
};

const FALLBACK_PALETTE = [
  ["#1B5BFF", "#5A8BFF"],
  ["#F97316", "#FFB347"],
  ["#0EA5E9", "#1B5BFF"],
  ["#7C3AED", "#EC4899"],
];

export default function PromotionCarousel({ promotions, onPress }: Props) {
  const { width } = useWindowDimensions();
  const itemWidth = Math.max(280, width - 32);
  if (!promotions.length) return null;

  return (
    <FlatList
      horizontal
      data={promotions}
      keyExtractor={(item) => String(item.id)}
      showsHorizontalScrollIndicator={false}
      snapToInterval={itemWidth + spacing.px12}
      decelerationRate="fast"
      contentContainerStyle={styles.list}
      renderItem={({ item, index }) => {
        const [c1, c2] = FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
        return (
          <Pressable
            style={[styles.banner, { width: itemWidth }]}
            onPress={() => onPress(item)}
            accessibilityRole="button"
            accessibilityLabel={`Khuyến mãi: ${item.title}`}
          >
            <ImageBackground
              source={item.image_url ? { uri: item.image_url } : undefined}
              style={[styles.image, { backgroundColor: c1 }]}
              imageStyle={styles.imageStyle}
              resizeMode="cover"
            >
              <View
                style={[
                  styles.overlay,
                  { backgroundColor: "transparent" },
                ]}
              />
              <View
                style={[
                  styles.gradientOverlay,
                  { backgroundColor: c2, opacity: 0.55 },
                ]}
              />
              <View style={styles.content}>
                <View style={styles.eyebrowChip}>
                  <Text style={styles.eyebrow}>NỔI BẬT</Text>
                </View>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.subtitle ? (
                  <Text style={styles.subtitle} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                ) : null}
                <View style={styles.action}>
                  <Text style={styles.actionText}>Khám phá</Text>
                  <ArrowRight color={colors.white} size={16} strokeWidth={2.6} />
                </View>
              </View>
            </ImageBackground>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.px12, paddingHorizontal: spacing.px16 },
  banner: {
    height: 180,
    borderRadius: colors.radius.xl,
    overflow: "hidden",
    ...shadows.cardHover,
  },
  image: { flex: 1, justifyContent: "flex-end" },
  imageStyle: { borderRadius: colors.radius.xl },
  overlay: { ...StyleSheet.absoluteFillObject },
  gradientOverlay: { ...StyleSheet.absoluteFillObject, opacity: 0.5 },
  content: { padding: spacing.px20, gap: 4 },
  eyebrowChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: colors.radius.pill,
    marginBottom: 8,
  },
  eyebrow: {
    ...typography.micro,
    color: colors.white,
  },
  title: {
    ...typography.h2,
    color: colors.white,
  },
  subtitle: {
    ...typography.small,
    color: "rgba(255,255,255,0.86)",
  },
  action: {
    marginTop: spacing.px10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: colors.radius.pill,
  },
  actionText: {
    ...typography.buttonSm,
    color: colors.white,
  },
});
