import React, { Component, PropTypes } from 'react';
import {
  StyleSheet,
} from 'react-native';
import { Components } from 'exponent';
import colors from '../config/colors';
import { NavigationStyles } from '@exponent/ex-navigation';

/**
 *  Shows the location of an event
 */
export default class LocationScreen extends Component {
  static route = {
    navigationBar: {
      visible: true,
      title: 'EVENT LOCATION',
      borderBottomColor: 'transparent',
      tintColor: colors.black,
      titleStyle: {
        fontFamily: 'open-sans-bold',
      },
      backgroundColor: 'white',
    },
    styles: {
      ...NavigationStyles.SlideHorizontal,
    },
  }

  static propTypes = {
    event: PropTypes.object.isRequired,
  }

  state = {
    region: null,
  }

  onRegionChange = (region) => {
    this.setState({ region });
  }

  render() {
    return (
      <Components.MapView
        style={ StyleSheet.absoluteFillObject }
        initialRegion={{
          latitude: this.props.event.location.geometry.location.lat,
          longitude: this.props.event.location.geometry.location.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        toolbarEnabled={ false }
        loadingEnabled
        region={ this.state.region }
        onRegionChange={ this.onRegionChange }
      >
        <Components.MapView.Marker
          title={ this.props.event.name }
          description={ this.props.event.location.address }
          coordinate={{
            latitude: this.props.event.location.geometry.location.lat,
            longitude: this.props.event.location.geometry.location.lng,
          }}
        />
      </Components.MapView>
    );
  }
}
