import React, { PropTypes } from "react";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CrossPlatformIcon = ({ name, size, color, outline }) => {
  let iconName = Platform.OS === "android" ? `md-${name}` : `ios-${name}`;
  if (outline) {
    iconName = `${iconName}-outline`;
  }
  return <Ionicons name={iconName} size={size} color={color} />;
};

CrossPlatformIcon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  color: PropTypes.string,
  outline: PropTypes.bool
};

export default CrossPlatformIcon;
