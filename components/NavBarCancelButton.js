import React, { PropTypes } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { withNavigation } from '@expo/ex-navigation';
import colors from 'kolors';

const NavBarCancelButton = ({ navigator }) => (
  <TouchableOpacity
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    }}
    onPress={() => navigator.pop()}
  >
    <Text
      style={{
        fontFamily: 'open-sans-bold',
        color: colors.black,
        fontSize: 12,
      }}
    >
      CANCEL
    </Text>
  </TouchableOpacity>
);

NavBarCancelButton.propTypes = {
  navigator: PropTypes.object,
};

export default withNavigation(NavBarCancelButton);
