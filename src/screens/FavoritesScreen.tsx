import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Heart from "lucide-react-native/icons/heart";

import ProductCard from "../components/ProductCard";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import { useCart } from "../context/CartContext";
import useRequireAuth from "../hooks/useRequireAuth";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { getFavorites, removeFavorite } from "../services/favoriteService";
import type { CatalogProduct } from "../types/catalog";

type Props = NativeStackScreenProps<RootStackParamList, "Favorites">;
type CartActions = {
  addToCart: (product: CatalogProduct, quantity?: number) => Promise<boolean>;
};

export default function FavoritesScreen({ navigation }: Props) {
  const isAuthenticated = useRequireAuth(navigation, "Favorites");
  const { addToCart } = useCart() as CartActions;
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError("");
    try {
      setProducts(await getFavorites());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Không tải được yêu thích.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));
  if (!isAuthenticated) return null;

  const remove = async (product: CatalogProduct) => {
    try {
      await removeFavorite(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch (nextError) {
      Alert.alert(
        "Không thể cập nhật",
        nextError instanceof Error ? nextError.message : "Vui lòng thử lại."
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Sản phẩm yêu thích" navigation={navigation} />
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.variantId}
          numColumns={2}
          columnWrapperStyle={styles.columns}
          contentContainerStyle={styles.content}
          refreshing={isLoading}
          onRefresh={load}
          ListHeaderComponent={error ? (
            <Pressable style={styles.error} onPress={load}>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.retry}>Chạm để thử lại</Text>
            </Pressable>
          ) : null}
          renderItem={({ item }) => (
            <View style={styles.productWrap}>
              <ProductCard
                product={item}
                style={styles.fullCard}
                onPress={() => navigation.navigate("ProductDetail", { product: item })}
                onAdd={() => addToCart(item)}
              />
              <Pressable
                style={styles.removeButton}
                onPress={() => remove(item)}
                accessibilityRole="button"
                accessibilityLabel={`Bỏ yêu thích ${item.name}`}
              >
                <Heart color={colors.red} fill={colors.red} size={17} />
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Heart color={colors.muted} size={32} />
              <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
              <Text style={styles.emptyText}>Lưu sản phẩm để xem lại nhanh hơn.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { flexGrow: 1, padding: 16, paddingBottom: 32 },
  columns: { justifyContent: "space-between" },
  productWrap: { width: "48.5%", position: "relative" },
  fullCard: { width: "100%" },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    elevation: 2,
  },
  error: { backgroundColor: colors.redLight, borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { color: colors.red, fontSize: 12 },
  retry: { color: colors.primary, fontSize: 11, fontWeight: "800", marginTop: 5 },
  empty: { alignItems: "center", paddingVertical: 80 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: "900", marginTop: 10 },
  emptyText: { color: colors.gray, fontSize: 12, marginTop: 6 },
});

