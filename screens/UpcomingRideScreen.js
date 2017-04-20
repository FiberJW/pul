import React, { Component, PropTypes } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  FlatList,
  Text,
  Image,
  ActivityIndicator
} from "react-native";
import colors from "kolors";
import { NavigationStyles } from "@expo/ex-navigation";
import Ride from "../components/Ride";
import connectDropdownAlert from "../utils/connectDropdownAlert";
import { observer, inject } from "mobx-react/native";

@connectDropdownAlert
@inject("eventStore")
@observer
export default class UpcomingRideScreen extends Component {
  static route = {
    styles: {
      ...NavigationStyles.Fade
    }
  };
  static propTypes = {
    navigator: PropTypes.object,
    navigation: PropTypes.object,
    eventStore: PropTypes.object,
    alertWithType: PropTypes.func.isRequired
  };

  componentWillUpdate(nextProps) {
    if (nextProps.eventStore.error) {
      nextProps.alertWithType(
        "error",
        "Error",
        nextProps.eventStore.error.toString()
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Choose>
          <When condition={this.props.eventStore.loading}>
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
          <When
            condition={
              this.props.eventStore.rides.slice().length ||
                this.props.eventStore.refreshing
            }
          >
            <FlatList
              data={this.props.eventStore.rides.slice()}
              refreshing={this.props.eventStore.refreshing}
              onRefresh={this.props.eventStore.refresh}
              renderItem={({ item }) => (
                <Ride
                  event={item}
                  refreshing={this.props.eventStore.refreshing}
                  refresh={this.props.eventStore.refresh}
                />
              )}
            />
          </When>
          <Otherwise>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Image
                resizeMode="contain"
                style={{
                  width: 150,
                  height: 150,
                  opacity: 0.3
                }}
                source={require("pul/assets/images/forever_alone.png")}
              />
              <Text
                style={{
                  marginTop: 16,
                  fontFamily: "open-sans",
                  fontSize: 18,
                  paddingHorizontal: 8,
                  color: "#AEAEAF",
                  textAlign: "center"
                }}
              >
                No need to feel alone. Check out your school's events and make it out to one!
              </Text>
            </View>
          </Otherwise>
        </Choose>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.eggshell
  }
});
