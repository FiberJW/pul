import React, { Component, PropTypes } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { NavigationStyles } from '@expo/ex-navigation';
import _ from 'lodash';
import colors from 'kolors';
import { MapView, Location } from 'expo';
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
export default class MeetDriverScreen extends Component {
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
    self: PropTypes.object.isRequired,
    driver: PropTypes.string.isRequired,
    alertWithType: PropTypes.func.isRequired,
  };

  @observable pickupLocation;
  @observable loading = true;
  @observable region;
  @observable location;
  @observable driverData;

  onRegionChange = region => {
    this.region = region;
  };

  componentWillMount() {
    global.firebaseApp
      .database()
      .ref('schools')
      .child(this.props.self.school)
      .child('pickupLocations')
      .once('value')
      .then(pickupLocationsSnap => {
        const pickupLocations = pickupLocationsSnap.val();
        _.each(pickupLocations, pickupLocation => {
          if (pickupLocation.name === this.props.self.location) {
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
            this.pickupLocation = pickupLocation;
          }
        });
        global.firebaseApp
          .database()
          .ref('users')
          .child(this.props.driver)
          .once('value')
          .then(driverSnap => {
            this.driverData = driverSnap.val();
            this.loading = false;
          });
      })
      .catch(err => {
        this.loading = false;
        this.props.alertWithType('error', 'Error', err.toString());
      });
  }

  componentWillUnmount() {
    this.locationSub.remove();
  }

  render() {
    return (
      <Choose>
        <When condition={this.loading}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        </When>
        <Otherwise>
          <View style={styles.container}>
            <MapView
              ref={c => {
                this.map = c;
              }}
              style={StyleSheet.absoluteFillObject}
              initialRegion={{
                latitude: this.pickupLocation.lat,
                longitude: this.pickupLocation.lon,
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
                title={this.pickupLocation.name}
                coordinate={{
                  latitude: this.pickupLocation.lat,
                  longitude: this.pickupLocation.lon,
                }}
                onCalloutPress={() => {
                  const wazeUrl = createWazeDeepLink(
                    this.pickupLocation.lat,
                    this.pickupLocation.lon
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
                      latitude: this.pickupLocation.lat,
                      longitude: this.pickupLocation.lon,
                    },
                    this.location,
                  ]}
                />
              </If>
            </MapView>
            <MapViewFloatingCard
              label={
                `Meet at the ${this.pickupLocation.name.toLowerCase().trim()}.`
              }
              onPress={() => this.map.animateToCoordinate({
                latitude: this.pickupLocation.lat,
                longitude: this.pickupLocation.lon,
              })}
            />
            <MapViewConsole
              name={this.driverData.displayName}
              onContact={() => {
                phonecall(this.driverData.phoneNumber, true);
              }}
              onClose={() => this.props.navigator.pop()}
            />
          </View>
        </Otherwise>
      </Choose>
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
