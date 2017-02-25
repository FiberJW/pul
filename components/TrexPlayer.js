import React, { PropTypes } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
} from 'react-native';
import colors from '../config/colors';
import ElevatedView from 'react-native-elevated-view';

const TrexPlayer = (props) => (
  <ElevatedView
    style={ styles.cardContainer }
    elevation={ 2 }
  >
    <View style={ styles.headerRow }>
      <Text style={ styles.place }>
        {`#${props.place}`}
      </Text>
      <Text style={ styles.name }>
        {props.player.displayName.toUpperCase()}
      </Text>
      <Text style={ styles.type }>
        {props.player.trexHighestScore}
      </Text>
    </View>
  </ElevatedView>
);

TrexPlayer.propTypes = {
  player: PropTypes.object.isRequired,
  place: PropTypes.number.isRequired,
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: 'white',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: 'open-sans-bold',
    fontSize: 16,
    color: colors.black,
    width: Dimensions.get('window').width / 2,
  },
  place: {
    fontFamily: 'open-sans-bold',
    fontSize: 16,
    color: colors.black,
  },
  type: {
    fontFamily: 'open-sans-bold',
    fontSize: 12,
  },
});

export default TrexPlayer;
