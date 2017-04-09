import React, { Component, PropTypes } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { MapView } from "expo";
import {
  GooglePlacesAutocomplete
} from "react-native-google-places-autocomplete";
import { googleApiKey } from "../config/keys";
import colors from "kolors";
import ElevatedView from "react-native-elevated-view";

export default class GetEventLocation extends Component {
  static propTypes = {
    location: PropTypes.any,
    keyboardHeight: PropTypes.number,
    onLocationSelect: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired
  };

  render() {
    return (
      <View style={styles.container}>
        {!this.props.submitting &&
          this.props.location &&
          <MapView
            style={StyleSheet.absoluteFillObject}
            scrollEnabled={false}
            initialRegion={{
              latitude: this.props.location.details.geometry.location.lat,
              longitude: this.props.location.details.geometry.location.lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
            }}
            region={{
              latitude: this.props.location.details.geometry.location.lat,
              longitude: this.props.location.details.geometry.location.lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
            }}
          >
            <MapView.Marker
              coordinate={{
                latitude: this.props.location.details.geometry.location.lat,
                longitude: this.props.location.details.geometry.location.lng
              }}
            />
          </MapView>}
        {!this.props.submitting &&
          <GooglePlacesAutocomplete
            placeholder="Event Location"
            minLength={2}
            listViewDisplayed="auto" /* true/false/undefined*/
            fetchDetails
            enablePoweredByContainer={!this.props.location}
            onPress={this.props.onLocationSelect}
            getDefaultValue={() => {
              return ""; // text input default value
            }}
            query={{
              key: googleApiKey,
              language: "en" // language of the results
            }}
            styles={{
              container: {
                width: Dimensions.get("window").width
              },
              description: {
                fontWeight: "bold"
              },
              predefinedPlacesDescription: {
                color: "#1faadb"
              },
              row: {
                backgroundColor: "white"
              }
            }}
            textInputProps={{
              autoCorrect: false,
              underlineColorAndroid: "transparent"
            }}
            nearbyPlacesAPI="GooglePlacesSearch" /* Which API to use: GoogleReverseGeocoding or GooglePlacesSearch*/
            GooglePlacesSearchQuery={{
              rankby: "distance"
            }}
          />}
        {this.props.keyboardHeight === 0 &&
          !this.props.submitting &&
          this.props.location &&
          <TouchableOpacity
            onPress={this.props.onSubmit}
            activeOpacity={0.7}
            style={styles.submitButtonContainer}
          >
            <ElevatedView style={styles.submitButton} elevation={4}>
              <Text style={styles.submitText}>
                SUBMIT EVENT
              </Text>
            </ElevatedView>
          </TouchableOpacity>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  submitButtonContainer: {
    marginBottom: Dimensions.get("window").height / 4
  },
  submitButton: {
    backgroundColor: colors.blue,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center"
  },
  submitText: {
    color: "white",
    fontFamily: "open-sans-bold",
    fontSize: 24
  }
});
