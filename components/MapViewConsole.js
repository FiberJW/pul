import React, { PropTypes } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import colors from "kolors";

const MapViewConsole = ({ name, onClose, onContact }) => (
  <View style={styles.actionContainer}>
    <View>
      <Text style={styles.name}>
        {name.toUpperCase()}
      </Text>
    </View>
    <View style={styles.buttonRow}>
      <TouchableOpacity onPress={onClose}>
        <View style={[styles.button, styles.closeButton]}>
          <Text style={styles.close}>CLOSE</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={onContact}>
        <View style={styles.button}>
          <Text style={styles.contact}>CONTACT</Text>
        </View>
      </TouchableOpacity>
    </View>
  </View>
);

MapViewConsole.propTypes = {
  name: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onContact: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  actionContainer: {
    paddingVertical: 8,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center"
  },
  name: {
    fontFamily: "open-sans-bold",
    color: colors.black,
    fontSize: 14,
    paddingBottom: 8
  },
  buttonRow: {
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lightGrey,
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row"
  },
  button: {
    paddingHorizontal: 16,
    alignItems: "center"
  },
  closeButton: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lightGrey
  },
  close: {
    fontFamily: "open-sans-bold",
    color: colors.hotPink,
    fontSize: 14
  },
  contact: {
    fontFamily: "open-sans-bold",
    color: colors.blue,
    fontSize: 14
  }
});

export default MapViewConsole;
