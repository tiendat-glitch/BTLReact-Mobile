import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import colors from "../constants/colors";

export default function SearchBar() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          style={styles.input}
          placeholder="Tìm món ăn, nhà hàng..."
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>☷</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  searchBox: {
    height: 54,
    backgroundColor: colors.white,
    borderRadius: 16,

    flexDirection: "row",
    alignItems: "center",

    paddingLeft: 15,
    paddingRight: 7,

    borderWidth: 1,
    borderColor: "#EEEEEE",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,

    elevation: 2,
  },

  searchIcon: {
    fontSize: 30,
    color: "#777",
    width: 30,
    textAlign: "center",
  },

  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: colors.text,
    paddingHorizontal: 8,
  },

  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 13,

    backgroundColor: colors.primary,

    alignItems: "center",
    justifyContent: "center",
  },

  filterIcon: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "700",
  },
});