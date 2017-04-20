import React, { Component, PropTypes } from "react";
import { TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import Icon from "../components/CrossPlatformIcon";
import { withNavigation } from "@expo/ex-navigation";
import Router from "../navigation/Router";
import tinycolor from "tinycolor2";
import colors from "kolors";

class SchoolOption extends Component {
  render() {
    const { school, intent, navigator } = this.props;
    return (
      <TouchableOpacity
        onPress={() =>
          navigator.push(Router.getRoute("getEmail", { school, intent }))}
        style={[
          styles.container,
          {
            backgroundColor: school.primaryColor
          }
        ]}
      >
        <Image
          resizeMode="contain"
          source={{ uri: school.logoUrl }}
          style={styles.schoolIcon}
        />
        <Text
          style={[
            styles.schoolName,
            {
              color: tinycolor(school.primaryColor).isDark()
                ? "white"
                : colors.black
            }
          ]}
        >
          {school.name}
        </Text>
        <Icon
          name="arrow-forward"
          size={24}
          color={
            tinycolor(school.primaryColor).isDark() ? "white" : colors.black
          }
        />
      </TouchableOpacity>
    );
  }
}

SchoolOption.propTypes = {
  school: PropTypes.object.isRequired,
  navigator: PropTypes.object.isRequired,
  intent: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  container: {
    height: 72,
    flexDirection: "row",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    alignItems: "center"
  },
  schoolIcon: {
    height: 48,
    width: 48
  },
  schoolName: {
    fontFamily: "open-sans",
    fontSize: 16
  }
});

export default withNavigation(SchoolOption);
