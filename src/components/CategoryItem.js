import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from "react-native";

import colors from "../constants/colors";

export default function CategoryItem({
  category,
  selected,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Danh mục ${category.name}`}
    >
      <View
        style={[
          styles.iconBox,
          selected && styles.selectedBox,
        ]}
      >
        <Text style={styles.emoji}>
          {category.emoji}
        </Text>
      </View>

      <Text
        style={[
          styles.name,
          selected && styles.selectedName,
        ]}
        numberOfLines={1}
      >
        {category.name}
      </Text>

      {selected && (
        <View style={styles.dot} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 76,
    alignItems: "center",
    marginRight: 10,
  },

  iconBox: {
    width: 62,
    height: 62,

    borderRadius: 20,

    backgroundColor: colors.white,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#EEEEEE",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,

    elevation: 1,
  },

  selectedBox: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },

  emoji: {
    fontSize: 30,
  },

  name: {
    marginTop: 7,

    fontSize: 11,

    color: colors.gray,

    fontWeight: "600",

    textAlign: "center",
  },

  selectedName: {
    color: colors.primary,
    fontWeight: "900",
  },

  dot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: colors.primary,

    marginTop: 4,
  },
});