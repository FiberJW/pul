import React from "react";
import { TouchableOpacity, Share, StyleSheet } from "react-native";
import Icon from "../components/CrossPlatformIcon";
import colors from "kolors";

const ShareButton = () => (
  <TouchableOpacity
    onPress={() =>
      Share.share({
        title: "Let's ride!",
        message: "Upgrade your school experience with PÜL!\n" +
          "https://play.google.com/store/apps/details?id=io.github.datwheat.pul\n" +
          "https://itunes.apple.com/us/app/p%C3%BCl-carpooling-for-students-by-students/id1196047562?ls=1&mt=8"
      })}
    style={styles.container}
  >
    <Icon name="share" size={24} color={colors.black} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    paddingRight: 16
  }
});

export default ShareButton;
