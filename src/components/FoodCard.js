import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import colors from "../constants/colors";

export default function FoodCard({
  food,
  onPress,
}) {
  const discount = Math.round(
    ((food.oldPrice - food.price) /
      food.oldPrice) *
      100
  );

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >

      {/* IMAGE */}

      <View style={styles.imageContainer}>

        <Text style={styles.emoji}>
          {food.emoji}
        </Text>

        {/* Discount */}

        <View style={styles.discount}>
          <Text style={styles.discountText}>
            -{discount}%
          </Text>
        </View>

        {/* Favorite */}

        <TouchableOpacity
          style={styles.favorite}
          onPress={(event) => {
            event.stopPropagation();
          }}
        >
          <Text style={styles.favoriteIcon}>
            ♡
          </Text>
        </TouchableOpacity>

      </View>

      {/* CONTENT */}

      <View style={styles.content}>

        <Text
          style={styles.name}
          numberOfLines={2}
        >
          {food.name}
        </Text>

        {/* Rating */}

        <View style={styles.ratingRow}>

          <Text style={styles.rating}>
            ★ {food.rating}
          </Text>

          <View style={styles.separator} />

          <Text style={styles.sold}>
            Đã bán {formatSold(food.sold)}
          </Text>

        </View>

        {/* PRICE */}

        <View style={styles.priceRow}>

          <Text style={styles.price}>
            {food.price.toLocaleString("vi-VN")}đ
          </Text>

          <Text style={styles.oldPrice}>
            {food.oldPrice.toLocaleString(
              "vi-VN"
            )}đ
          </Text>

        </View>

        {/* DELIVERY */}

        <View style={styles.deliveryRow}>

          <View style={styles.deliveryTag}>
            <Text style={styles.deliveryText}>
              🚴 {food.deliveryTime}
            </Text>
          </View>

          <View style={styles.addButton}>
            <Text style={styles.addText}>
              +
            </Text>
          </View>

        </View>

      </View>

    </TouchableOpacity>
  );
}

function formatSold(number) {
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}k`;
  }

  return number;
}

const styles = StyleSheet.create({
  card: {
    width: "48.3%",

    backgroundColor: colors.white,

    borderRadius: 17,

    marginBottom: 15,

    overflow: "hidden",

    borderWidth: 1,
    borderColor: "#EEEEEE",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,

    elevation: 2,
  },

  /* IMAGE */

  imageContainer: {
    height: 145,

    backgroundColor: colors.primaryLight,

    justifyContent: "center",
    alignItems: "center",

    position: "relative",
  },

  emoji: {
    fontSize: 78,
  },

  discount: {
    position: "absolute",

    top: 9,
    left: 9,

    backgroundColor: colors.red,

    paddingHorizontal: 7,
    paddingVertical: 4,

    borderRadius: 6,
  },

  discountText: {
    color: colors.white,

    fontSize: 9,

    fontWeight: "900",
  },

  favorite: {
    position: "absolute",

    top: 8,
    right: 8,

    width: 31,
    height: 31,

    borderRadius: 16,

    backgroundColor: colors.white,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,

    elevation: 2,
  },

  favoriteIcon: {
    fontSize: 20,
    color: colors.primary,
  },

  /* CONTENT */

  content: {
    padding: 11,
  },

  name: {
    minHeight: 38,

    fontSize: 14,

    lineHeight: 19,

    fontWeight: "800",

    color: colors.text,
  },

  /* RATING */

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 6,
  },

  rating: {
    fontSize: 11,

    color: "#F59E0B",

    fontWeight: "800",
  },

  separator: {
    width: 1,
    height: 10,

    backgroundColor: "#DDD",

    marginHorizontal: 6,
  },

  sold: {
    fontSize: 9,

    color: colors.gray,
  },

  /* PRICE */

  priceRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 7,
  },

  price: {
    fontSize: 16,

    color: colors.primary,

    fontWeight: "900",
  },

  oldPrice: {
    fontSize: 9,

    color: "#999",

    textDecorationLine: "line-through",

    marginLeft: 5,
  },

  /* DELIVERY */

  deliveryRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginTop: 9,
  },

  deliveryTag: {
    backgroundColor: "#F5F5F5",

    paddingHorizontal: 6,
    paddingVertical: 4,

    borderRadius: 6,

    flex: 1,

    marginRight: 7,
  },

  deliveryText: {
    fontSize: 8,

    color: colors.gray,
  },

  addButton: {
    width: 30,
    height: 30,

    borderRadius: 10,

    backgroundColor: colors.primary,

    alignItems: "center",
    justifyContent: "center",
  },

  addText: {
    color: colors.white,

    fontSize: 21,

    lineHeight: 22,

    fontWeight: "700",
  },
});