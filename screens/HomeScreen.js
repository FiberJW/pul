import React, { Component, PropTypes } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Image,
  Vibration,
  Text
} from "react-native";
import Event from "../components/Event";
import ActionButton from "react-native-action-button";
import colors from "kolors";
import Icon from "../components/CrossPlatformIcon";
import { NavigationStyles } from "@expo/ex-navigation";
import Router from "../navigation/Router";
import connectDropdownAlert from "../utils/connectDropdownAlert";
import { observer, inject } from "mobx-react/native";

@connectDropdownAlert
@inject("eventStore", "authStore")
@observer
export default class HomeScreen extends Component {
  static route = {
    styles: {
      ...NavigationStyles.Fade
    }
  };

  static propTypes = {
    navigator: PropTypes.object,
    alertWithType: PropTypes.func.isRequired,
    navigation: PropTypes.object,
    eventStore: PropTypes.object,
    authStore: PropTypes.object
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
              this.props.eventStore.events.length ||
                this.props.eventStore.refreshing
            }
          >
            <FlatList
              style={{ marginTop: 4 }}
              data={this.props.eventStore.events.slice()}
              keyExtractor={(item, index) => index}
              refreshing={this.props.eventStore.refreshing}
              onRefresh={this.props.eventStore.refresh}
              renderItem={({ item }) => (
                <Event event={item} refresh={this.props.eventStore.refresh} />
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
                source={require("pul/assets/images/PokerFace.png")}
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
                No events? Your school must be pretty lame.
              </Text>
            </View>
          </Otherwise>
        </Choose>
        <ActionButton
          offsetX={16}
          offsetY={16}
          onPress={() => {
            if (this.props.authStore.verified) {
              this.props.navigation.getNavigator("master").push(
                Router.getRoute("eventAdmin", {
                  refresh: this.props.eventStore.refresh,
                  editMode: false
                })
              );
            } else {
              this.props.alertWithType(
                "error",
                "Error",
                "You must verify your email before continuing. No creepers allowed!"
              );
            }
          }}
          onLongPress={() => {
            Vibration.vibrate([0, 25]);
            if (this.props.authStore.verified) {
              this.props.navigation
                .getNavigator("master")
                .push(Router.getRoute("trex"));
            } else {
              this.props.alertWithType(
                "error",
                "Error",
                "You must verify your email before continuing. No creepers allowed!"
              );
            }
          }}
          buttonColor={colors.black}
          icon={<Icon name="add" size={24} color="white" />}
        />
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
