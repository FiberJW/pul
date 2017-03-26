import React, { Component, PropTypes } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
} from 'react-native';
import { NavigationStyles } from '@expo/ex-navigation';
import colors from 'kolors';
import { MapView, Location } from 'expo';
import ElevatedView from 'react-native-elevated-view';
import { maybeOpenURL } from 'react-native-app-link';
import connectDropdownAlert from '../utils/connectDropdownAlert';
import createWazeDeepLink from '../utils/createWazeDeepLink';
import { phonecall } from 'react-native-communications';
import { observer } from 'mobx-react/native';
import { observable } from 'mobx';
import MapViewFloatingCard from '../components/MapViewFloatingCard';
import MapViewConsole from '../components/MapViewConsole';
import DestinationMarker from '../components/styled/DestinationMarker';

@connectDropdownAlert
@observer
export default class MeetRiderScreen extends Component {
  static route = {
    navigationBar: {
      visible: false,
    },
    styles: {
      ...NavigationStyles.SlideHorizontal,
    },
  };

  static propTypes = {
    navigator: PropTypes.object.isRequired,
    navigation: PropTypes.object.isRequired,
    pickupLocation: PropTypes.object.isRequired,
    rider: PropTypes.object.isRequired,
    alertWithType: PropTypes.func.isRequired,
  };

  @observable region;
  @observable location;

  componentWillMount() {
    Location.watchPositionAsync(
      {
        enableHighAccuracy: true,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      data => {
        this.location = {
          latitude: data.coords.latitude,
          longitude: data.coords.longitude,
        };
      }
    ).then(locationSub => {
      this.locationSub = locationSub;
    });
  }

  componentWillUnmount() {
    this.locationSub.remove();
  }

  onRegionChange = region => this.region = region;

  render() {
    return (
      <View style={styles.container}>
        <MapView
          ref={c => {
            this.map = c;
          }}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: this.props.pickupLocation.lat,
            longitude: this.props.pickupLocation.lon,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation
          followsUserLocation
          toolbarEnabled={false}
          loadingEnabled
          region={this.region}
          onRegionChange={this.onRegionChange}
        >
          <StatusBar hidden />
          <MapView.Marker
            title={this.props.pickupLocation.name}
            coordinate={{
              latitude: this.props.pickupLocation.lat,
              longitude: this.props.pickupLocation.lon,
            }}
            onCalloutPress={() => {
              const wazeUrl = createWazeDeepLink(
                this.props.pickupLocation.lat,
                this.props.pickupLocation.lon
              );

              maybeOpenURL(wazeUrl, {
                appName: 'Waze',
                appStoreId: 'id323229106',
                playStoreId: 'com.waze',
              }).catch(err => {
                this.props.alertWithType('error', 'Error', err.toString());
              });
            }}
          >
            <DestinationMarker />
          </MapView.Marker>
          <If condition={this.location}>
            <MapView.Polyline
              strokeWidth={2}
              strokeColor={colors.black}
              geodesic
              lineDashPattern={[4, 8, 4, 8]}
              coordinates={[
                {
                  latitude: this.props.pickupLocation.lat,
                  longitude: this.props.pickupLocation.lon,
                },
                this.location,
              ]}
            />
          </If>
        </MapView>
        <MapViewFloatingCard
          label={
            `Pickup at the ${this.props.pickupLocation.name
              .toLowerCase()
              .trim()}.`
          }
          onPress={() => this.map.animateToCoordinate({
            latitude: this.props.pickupLocation.lat,
            longitude: this.props.pickupLocation.lon,
          })}
        />
        <MapViewConsole
          name={this.props.rider.displayName}
          onContact={() => {
            phonecall(this.props.rider.phoneNumber, true);
          }}
          onClose={() => this.props.navigator.pop()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
