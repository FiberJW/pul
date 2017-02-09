import React from 'react';
import {
  TouchableOpacity,
  Share,
  StyleSheet,
} from 'react-native';
import Icon from '../components/CrossPlatformIcon';
import colors from '../config/colors';

const ShareButton = () => (
  <TouchableOpacity
    onPress={ () => Share.share({
      title: 'Let\'s ride!',
      message: 'Upgrade your school experience with PÜL!\n' +
      'https://play.google.com/store/apps/details?id=io.github.datwheat.pul' +
      '',
    }) }
    style={ styles.container }
  >
    <Icon
      name="share"
      outline
      size={ 24 }
      color={ colors.black }
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
});

export default ShareButton;
