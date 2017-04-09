import React from "react";
import { View, StyleSheet, Image, Platform } from "react-native";

const NavbarTitle = () => (
  <View style={styles.container}>
    <Image
      resizeMethod="resize"
      source={require("../assets/images/pul_logo_black.png")}
      style={styles.logo}
      resizeMode="contain"
    />
  </View>
);

const styles = StyleSheet.create({
  logo: {
    height: 24,
    width: 60
  },
  container: {
    flex: 1,
    justifyContent: Platform.OS === "android" ? "flex-start" : "center",
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center"
  }
});

export default NavbarTitle;
