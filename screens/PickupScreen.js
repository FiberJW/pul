import React, { Component, PropTypes } from "react";
import { View, ActivityIndicator, StyleSheet, StatusBar } from "react-native";
import { NavigationStyles } from "@expo/ex-navigation";
import { MapView, Location, KeepAwake } from "expo";
import { maybeOpenURL } from "react-native-app-link";
import connectDropdownAlert from "../utils/connectDropdownAlert";
import createWazeDeepLink from "../utils/createWazeDeepLink";
import { phonecall } from "react-native-communications";
import { observer } from "mobx-react/native";
import { observable } from "mobx";
import MapViewFloatingCard from "../components/MapViewFloatingCard";
import MapViewConsole from "../components/MapViewConsole";
import DestinationMarker from "../components/styled/DestinationMarker";
import mapStyles from "../config/mapStyles";

@connectDropdownAlert
@observer
export default class PickupScreen extends Component {
  static route = {
    navigationBar: {
      visible: false
    },
    styles: {
      ...NavigationStyles.SlideHorizontal
    }
  };

  static propTypes = {
    navigator: PropTypes.object.isRequired,
    navigation: PropTypes.object.isRequired,
    self: PropTypes.object,
    pickupLocation: PropTypes.object.isRequired,
    driver: PropTypes.object,
    rider: PropTypes.object,
    alertWithType: PropTypes.func.isRequired
  };

  @observable loading = true;
  @observable region;
  @observable location;

  onRegionChange = region => {
    this.region = region;
  };

  componentWillMount() {
    Location.watchPositionAsync(
      {
        enableHighAccuracy: true,
        timeInterval: 1000,
        distanceInterval: 1
      },
      data => {
        this.location = {
          latitude: data.coords.latitude,
          longitude: data.coords.longitude
        };
      }
    )
      .then(locationSub => {
        this.locationSub = locationSub;
        this.loading = false;
      })
      .catch(err => {
        this.props.alertWithType("error", "Error", err.toString());
        this.loading = false;
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
              justifyContent: "center",
              alignItems: "center",
              flex: 1
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        </When>
        <Otherwise>
          <View style={styles.container}>
            <KeepAwake />
            <MapView
              ref={c => {
                this.map = c;
              }}
              provider={MapView.PROVIDER_GOOGLE}
              customMapStyle={mapStyles}
              style={StyleSheet.absoluteFillObject}
              initialRegion={{
                latitude: this.props.pickupLocation.lat,
                longitude: this.props.pickupLocation.lon,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
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
                  longitude: this.props.pickupLocation.lon
                }}
                onCalloutPress={() => {
                  const wazeUrl = createWazeDeepLink(
                    this.props.pickupLocation.lat,
                    this.props.pickupLocation.lon
                  );

                  maybeOpenURL(wazeUrl, {
                    appName: "Waze",
                    appStoreId: "id323229106",
                    playStoreId: "com.waze"
                  }).catch(err => {
                    this.props.alertWithType("error", "Error", err.toString());
                  });
                }}
              >
                <DestinationMarker />
              </MapView.Marker>
            </MapView>
            <MapViewFloatingCard
              label={`Meet at the ${this.props.pickupLocation.name
                .toLowerCase()
                .trim()}.`}
              onPress={() =>
                this.map.animateToCoordinate({
                  latitude: this.props.pickupLocation.lat,
                  longitude: this.props.pickupLocation.lon
                })}
            />
            <MapViewConsole
              name={
                this.props.driver
                  ? this.props.driver.displayName
                  : this.props.rider.displayName
              }
              onContact={() => {
                phonecall(
                  this.props.driver
                    ? this.props.driver.phoneNumber
                    : this.props.rider.phoneNumber,
                  true
                );
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
    alignItems: "center",
    justifyContent: "space-between"
  }
});
