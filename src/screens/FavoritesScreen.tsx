// @ts-nocheck
import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Heart from "lucide-react-native/icons/heart";

import Button from "../components/Button";
import FeedbackState from "../components/FeedbackState";
import ProductCard from "../components/ProductCard";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import spacing from "../constants/spacing";
import typography from "../constants/typography";
import { useCart } from "../context/CartContext";
import useRequireAuth from "../hooks/useRequireAuth";
import useCompareAction from "../hooks/useCompareAction";
import { getFavorites, removeFavorite } from "../services/favoriteService";

export default function FavoritesScreen({ navigation }) {
  const isAuthenticated = useRequireAuth(navigation, "Favorites");
  const { addToCart } = useCart();
  const compare = useCompareAction();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError("");
    try {
      setProducts(await getFavorites());
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  if (!isAuthenticated) return null;

  const remove = (product) => {
    Alert.alert(
      "Bỏ yêu thích",
      `Xóa "${product.name}" khỏi danh sách yêu thích?`,
      [
        { text: "Không", style: "cancel" },
        {
          text: "Bỏ",
          style: "destructive",
          onPress: async () => {
            try {
              await removeFavorite(product.id);
              setProducts((current) => current.filter((item) => item.id !== product.id));
            } catch (nextError) {
              Alert.alert(
                "Không thể cập nhật",
                nextError.message || "Vui lòng thử lại.",
              );
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <ScreenHeader title="Sản phẩm yêu thích" navigation={navigation} />
        <FeedbackState variant="loading" fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader title="Sản phẩm yêu thích" navigation={navigation} />
      <ScrollView contentContainerStyle={styles.body} style={styles.scrollFlex}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {products.length === 0 ? (
          <FeedbackState
            variant="empty"
            title="Chưa có sản phẩm yêu thích"
            description="Lưu sản phẩm để xem lại nhanh hơn."
            fullScreen
          >
            <View style={styles.shopButton}>
              <Button
                label="Khám phá sản phẩm"
                variant="primary"
                leadingIcon={(color) => (
                  <Heart color={color} size={18} strokeWidth={2.4} />
                )}
                onPress={() => navigation.navigate("Main")}
              />
            </View>
          </FeedbackState>
        ) : (
          <View style={styles.grid}>
            {products.map((product) => (
              <View key={product.id} style={styles.item}>
                <ProductCard
                  product={product}
                  style={styles.fullCard}
                  onPress={() => navigation.navigate("ProductDetail", { product })}
                  onAdd={() => addToCart(product)}
                  onCompare={() => compare.toggle(product)}
                  inCompare={compare.hasProduct(product.id)}
                />
                <Button
                  variant="tonal"
                  size="sm"
                  fullWidth={false}
                  label=""
                  accessibilityLabel={`Bỏ yêu thích ${product.name}`}
                  leadingIcon={(color) => (
                    <Heart
                      color={color}
                      fill={color}
                      size={16}
                      strokeWidth={2.2}
                    />
                  )}
                  onPress={() => remove(product)}
                  style={styles.removeButton}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollFlex: { flex: 1 },
  body: { flexGrow: 1, padding: spacing.px16, paddingBottom: spacing.px40 },
  error: {
    ...typography.captionStrong,
    color: colors.red,
    backgroundColor: colors.redLight,
    padding: spacing.px12,
    borderRadius: colors.radius.md,
    marginBottom: spacing.px12,
  },
  shopButton: { paddingTop: spacing.px16, width: 240 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  item: { width: "48.5%" },
  fullCard: { width: "100%" },
  removeButton: {
    position: "absolute",
    top: spacing.px8,
    right: spacing.px8,
  },
});