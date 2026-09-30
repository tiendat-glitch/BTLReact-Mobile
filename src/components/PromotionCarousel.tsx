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
import type { Promotion } from "../services/promotionService";

type Props = {
  promotions: Promotion[];
  onPress: (promotion: Promotion) => void;
};

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
      snapToInterval={itemWidth + 10}
      decelerationRate="fast"
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable
          style={[styles.banner, { width: itemWidth }]}
          onPress={() => onPress(item)}
          accessibilityRole="button"
        >
          <ImageBackground
            source={item.image_url ? { uri: item.image_url } : undefined}
            style={styles.image}
            imageStyle={styles.imageStyle}
            resizeMode="cover"
          >
            <View style={styles.overlay} />
            <View style={styles.content}>
              <Text style={styles.eyebrow}>NỔI BẬT</Text>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              {item.subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text> : null}
              <View style={styles.action}>
                <Text style={styles.actionText}>Khám phá</Text>
                <ArrowRight color={colors.white} size={17} />
              </View>
            </View>
          </ImageBackground>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  banner: { height: 184, borderRadius: 8, overflow: "hidden", backgroundColor: colors.black },
  image: { flex: 1, justifyContent: "flex-end" },
  imageStyle: { borderRadius: 8 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,23,42,0.54)" },
  content: { padding: 18 },
  eyebrow: { color: "#BFDBFE", fontSize: 10, fontWeight: "900" },
  title: { maxWidth: 290, color: colors.white, fontSize: 23, lineHeight: 28, fontWeight: "900", marginTop: 5 },
  subtitle: { maxWidth: 285, color: "#E2E8F0", fontSize: 12, lineHeight: 18, marginTop: 5 },
  action: { minHeight: 36, flexDirection: "row", alignItems: "center", alignSelf: "flex-start", marginTop: 8 },
  actionText: { color: colors.white, fontSize: 12, fontWeight: "800", marginRight: 6 },
});
