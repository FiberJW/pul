import React, { PropTypes } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import ElevatedView from 'react-native-elevated-view';
import colors from 'kolors';

const MapViewFloatingCard = props => (
  <TouchableOpacity onPress={props.onPress}>
    <ElevatedView style={styles.infoBox} elevation={4}>
      <Text style={styles.infoBoxText}>
        {props.label}
      </Text>
    </ElevatedView>
  </TouchableOpacity>
);

MapViewFloatingCard.propTypes = {
  onPress: PropTypes.func,
  label: PropTypes.string,
};

const styles = StyleSheet.create({
  infoBox: {
    backgroundColor: colors.black,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 64,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBoxText: {
    fontFamily: 'open-sans',
    fontSize: 16,
    color: 'white',
  },
});

export default MapViewFloatingCard;
