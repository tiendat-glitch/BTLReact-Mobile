import React, { useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import SearchBar from "../components/SearchBar";
import PromoBanner from "../components/PromoBanner";
import CategoryItem from "../components/CategoryItem";
import FoodCard from "../components/FoodCard";

import categoryData from "../data/categoryData";
import foodData from "../data/foodData";

import colors from "../constants/colors";
import { useCart } from "../context/CartContext";

export default function HomeScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const { cart } = useCart();

  const filteredFoods =
    selectedCategory === "Tất cả"
      ? foodData
      : foodData.filter((food) => food.category === selectedCategory);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.locationLabel}>📍 Giao đến</Text>

            <TouchableOpacity>
              <Text style={styles.location}>Hoàn Kiếm, Hà Nội ▾</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate("Cart")}
          >
            <Text style={styles.cartIcon}>🛒</Text>

            {cart.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* SEARCH */}

        <View style={styles.searchWrapper}>
          <SearchBar />
        </View>

        {/* BANNER */}

        <PromoBanner />

        {/* CATEGORY */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh mục</Text>

          <Text style={styles.seeAll}>Xem tất cả</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryList}
        >
          {categoryData.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              selected={selectedCategory === category.name}
              onPress={() => setSelectedCategory(category.name)}
            />
          ))}
        </ScrollView>

        {/* FOOD */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Món ăn phổ biến 🔥</Text>

            <Text style={styles.sectionSubTitle}>
              Được nhiều người yêu thích
            </Text>
          </View>

          <Text style={styles.seeAll}>Xem thêm</Text>
        </View>

        <View style={styles.foodGrid}>
          {filteredFoods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onPress={() =>
                navigation.navigate("FoodDetail", {
                  food,
                })
              }
            />
          ))}
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.activeIcon}>🏠</Text>

          <Text style={styles.activeText}>Trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏷️</Text>

          <Text style={styles.navText}>Ưu đãi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Cart")}
        >
          <View>
            <Text style={styles.navIcon}>🛒</Text>

            {cart.length > 0 && <View style={styles.navBadge} />}
          </View>

          <Text style={styles.navText}>Giỏ hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>

          <Text style={styles.navText}>Tài khoản</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  locationLabel: {
    fontSize: 11,
    color: colors.gray,
  },

  location: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginTop: 3,
  },

  cartButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  cartIcon: {
    fontSize: 22,
  },

  badge: {
    position: "absolute",
    right: -2,
    top: -4,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
  },

  searchWrapper: {
    marginTop: 18,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: colors.text,
  },

  sectionSubTitle: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 3,
  },

  seeAll: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  categoryList: {
    marginHorizontal: -2,
  },

  foodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  bottomNav: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.white,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 65,
  },

  activeIcon: {
    fontSize: 21,
  },

  navIcon: {
    fontSize: 20,
  },

  activeText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: "800",
    marginTop: 3,
  },

  navText: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 3,
  },

  navBadge: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
    right: -2,
    top: -1,
  },
});
