import React, { Component, PropTypes } from "react";
import { StyleSheet } from "react-native";
import { MapView } from "expo";
import colors from "kolors";
import { NavigationStyles } from "@expo/ex-navigation";
import { observer } from "mobx-react/native";
import { observable } from "mobx";
import mapStyles from "../config/mapStyles";

@observer
export default class LocationScreen extends Component {
  static route = {
    navigationBar: {
      visible: true,
      title: "EVENT LOCATION",
      borderBottomColor: "transparent",
      tintColor: colors.black,
      titleStyle: {
        fontFamily: "open-sans-bold"
      },
      backgroundColor: "white"
    },
    styles: {
      ...NavigationStyles.SlideHorizontal
    }
  };

  static propTypes = {
    event: PropTypes.object.isRequired
  };

  @observable region = null;

  onRegionChange = region => {
    this.region = region;
  };

  render() {
    return (
      <MapView
        provider={MapView.PROVIDER_GOOGLE}
        customMapStyle={mapStyles}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: this.props.event.location.geometry.location.lat,
          longitude: this.props.event.location.geometry.location.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        }}
        toolbarEnabled={false}
        loadingEnabled
        region={this.region}
        onRegionChange={this.onRegionChange}
      >
        <MapView.Marker
          title={this.props.event.name}
          description={this.props.event.location.address}
          coordinate={{
            latitude: this.props.event.location.geometry.location.lat,
            longitude: this.props.event.location.geometry.location.lng
          }}
        />
      </MapView>
    );
  }
}
