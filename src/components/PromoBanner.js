import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import colors from "../constants/colors";

export default function PromoBanner() {
  return (
    <View style={styles.banner}>

      <View style={styles.left}>

        <View style={styles.tag}>
          <Text style={styles.tagText}>
            ⚡ DEAL CÔNG NGHỆ
          </Text>
        </View>

        <Text style={styles.title}>
          Nâng cấp góc máy
        </Text>

        <Text style={styles.discount}>
          -50%
        </Text>

        <Text style={styles.description}>
          Ưu đãi laptop & phụ kiện
        </Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>
            Xem ưu đãi →
          </Text>
        </TouchableOpacity>

      </View>

      <View style={styles.right}>

        <View style={styles.circle}>
          <Text style={styles.productEmoji}>
            💻
          </Text>
        </View>

        <View style={styles.smallCircle}>
          <Text style={styles.accessoryEmoji}>
            🎧
          </Text>
        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 175,
    backgroundColor: colors.primary,
    borderRadius: 22,

    marginTop: 18,

    paddingLeft: 20,
    paddingTop: 17,

    flexDirection: "row",
    overflow: "hidden",
  },

  left: {
    flex: 1,
    zIndex: 2,
  },

  tag: {
    alignSelf: "flex-start",

    backgroundColor: "rgba(255,255,255,0.2)",

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 8,
  },

  tagText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "900",
  },

  title: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
  },

  discount: {
    color: colors.white,
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 40,
  },

  description: {
    color: "#FFE8DD",
    fontSize: 11,
  },

  button: {
    backgroundColor: colors.white,

    paddingHorizontal: 14,
    paddingVertical: 8,

    borderRadius: 9,

    alignSelf: "flex-start",

    marginTop: 9,
  },

  buttonText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
  },

  right: {
    width: 145,
    position: "relative",
  },

  circle: {
    position: "absolute",

    width: 145,
    height: 145,

    borderRadius: 75,

    backgroundColor: "rgba(255,255,255,0.16)",

    right: -35,
    top: 10,

    justifyContent: "center",
    alignItems: "center",
  },

  productEmoji: {
    fontSize: 90,
    transform: [
      {
        rotate: "-8deg",
      },
    ],
  },

  smallCircle: {
    position: "absolute",

    width: 60,
    height: 60,

    borderRadius: 30,

    backgroundColor: colors.white,

    right: 5,
    bottom: 8,

    justifyContent: "center",
    alignItems: "center",
  },

  accessoryEmoji: {
    fontSize: 35,
  },
});