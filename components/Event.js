import React, { Component, PropTypes } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
  Vibration,
  Platform,
  Alert
} from "react-native";
import Router from "../navigation/Router";
import { withNavigation } from "@expo/ex-navigation";
import colors from "kolors";
import Collapsible from "react-native-collapsible";
import moment from "moment";
import ElevatedView from "fiber-react-native-elevated-view";
import createLyftDeepLink from "../utils/createLyftDeepLink";
import filter from "../utils/filter";
import { maybeOpenURL } from "react-native-app-link";
import connectDropdownAlert from "../utils/connectDropdownAlert";
import CardLabel from "./styled/CardLabel";
import CardHeader from "./styled/CardHeader";
import CardSublabel from "./styled/CardSublabel";
import { observer, inject } from "mobx-react/native";
import { observable } from "mobx";
import Icon from "../components/CrossPlatformIcon";

@withNavigation
@connectDropdownAlert
@inject("authStore", "eventStore")
@observer
export default class Event extends Component {
  static propTypes = {
    event: PropTypes.object.isRequired,
    authStore: PropTypes.object.isRequired,
    eventStore: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    navigation: PropTypes.object.isRequired,
    refresh: PropTypes.func,
    alertWithType: PropTypes.func.isRequired
  };

  @observable isCollapsed = true;
  @observable isRider = false;
  @observable isDriver = false;

  componentWillMount() {
    if (this.props.event.rides) {
      this.props.event.rides.forEach(ride => {
        if (ride.driver === this.props.authStore.userId) {
          this.isDriver = true;
        }
        if (ride.passengers) {
          ride.passengers.some(passenger => {
            if (passenger.userUID === this.props.authStore.userId) {
              this.isRider = true;
              return true;
            }
            return false;
          });
        }
      });
    }
  }

  render() {
    return (
      <ElevatedView
        feedbackEnabled
        activeElevation={4}
        onLongPress={() => {
          if (this.props.event.createdBy === this.props.authStore.userId) {
            Vibration.vibrate([0, 25]);
            Alert.alert(
              Platform.OS === "ios" ? "Update Event?" : "Update event?",
              "🚗 🚙",
              [
                {
                  text: "Cancel",
                  onPress: () => {},
                  style: "cancel"
                },
                {
                  text: "Delete",
                  onPress: () => {
                    Alert.alert(
                      Platform.OS === "ios" ? "Are You Sure?" : "Are you sure?",
                      "Deleting this event will remove any pending rides.",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "OK",
                          onPress: () =>
                            global.firebaseApp
                              .database()
                              .ref("users")
                              .child(this.props.authStore.userId)
                              .once("value")
                              .then(userSnap => {
                                const school = userSnap.val().school;
                                global.firebaseApp
                                  .database()
                                  .ref("schools")
                                  .child(school)
                                  .child("events")
                                  .child(this.props.event.uid)
                                  .remove();
                              })
                              .catch(error => {
                                this.props.alertWithType(
                                  "error",
                                  "Error",
                                  error.toString()
                                );
                              })
                        }
                      ]
                    );
                  }
                },
                {
                  text: "Edit",
                  onPress: () =>
                    this.props.navigation.getNavigator("master").push(
                      Router.getRoute("eventAdmin", {
                        event: this.props.event,
                        refresh: this.props.eventStore.refresh,
                        editMode: true
                      })
                    )
                }
              ]
            );
          }
        }}
        onPress={() => {
          this.isCollapsed = !this.isCollapsed;
        }}
        style={styles.cardContainer}
        elevation={2}
      >
        <CardHeader>
          <CardLabel>
            {filter.clean(this.props.event.name.toUpperCase())}
          </CardLabel>
          <CardSublabel>
            {this.props.event.type.toUpperCase()}
          </CardSublabel>
        </CardHeader>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <View>
            <Text
              onPress={() => {
                this.isCollapsed = !this.isCollapsed;
              }}
              onLongPress={() => {
                this.props.navigation
                  .getNavigator("master")
                  .push(
                    Router.getRoute("location", { event: this.props.event })
                  );
              }}
              style={styles.location}
            >
              {this.props.event.location.address}
            </Text>
            <Text style={styles.time}>
              {moment(this.props.event.date)
                .add(this.props.event.time.hours, "hours")
                .add(this.props.event.time.minutes, "minutes")
                .format("LLLL")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              global.firebaseApp
                .database()
                .ref("schools")
                .child(this.props.event.schoolUID)
                .child("events")
                .child(this.props.event.uid)
                .update({
                  likes: {
                    [this.props.authStore
                      .userId]: !this.props.event.likes.includes(
                      this.props.authStore.userId
                    )
                  }
                });
            }}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <Icon
              name="heart"
              color={colors.black}
              size={16}
              outline={
                !this.props.event.likes.includes(this.props.authStore.userId)
              }
            />
            <Text
              style={{
                fontSize: 12,
                marginLeft: 4,
                color: colors.black,
                fontFamily: "open-sans"
              }}
            >
              {this.props.event.likes.length}
            </Text>
          </TouchableOpacity>
        </View>
        <Collapsible duration={200} collapsed={this.isCollapsed}>
          <If condition={this.props.event.description}>
            <Text style={styles.description}>
              {filter.clean(this.props.event.description)}
            </Text>
          </If>
          <If condition={this.props.event.url}>
            <Text
              style={styles.website}
              onPress={() => {
                this.isCollapsed = !this.isCollapsed;
              }}
              onLongPress={() => {
                let url;
                if (
                  this.props.event.url.includes("http") ||
                  this.props.event.url.includes("https")
                ) {
                  url = this.props.event.url;
                } else {
                  url = `http://${this.props.event.url}`;
                }
                Linking.canOpenURL(url)
                  .then(supported => {
                    if (!supported) {
                      return false;
                    }
                    return Linking.openURL(url);
                  })
                  .catch(err => {
                    this.props.alertWithType("error", "Error", err.toString());
                  });
              }}
            >
              {filter.clean(this.props.event.url)}
            </Text>
          </If>
          <View style={styles.buttons}>
            <TouchableOpacity
              disabled={
                !this.props.event.availableRides ||
                  this.isRider ||
                  this.isDriver
              }
              onPress={() => {
                if (this.props.authStore.verified) {
                  this.props.navigation.getNavigator("master").push(
                    Router.getRoute("setPickupLocation", {
                      refresh: this.props.refresh,
                      event: this.props.event
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
              style={[
                styles.rideButton,
                {
                  backgroundColor: !this.props.event.availableRides ||
                    this.isRider ||
                    this.isDriver
                    ? colors.disabledBlue
                    : colors.blue
                }
              ]}
            >
              <Text style={styles.rideButtonText}>
                RIDE
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={this.isRider || this.isDriver}
              onPress={() => {
                if (this.props.authStore.verified) {
                  this.props.navigation.getNavigator("master").push(
                    Router.getRoute("setDriveOptions", {
                      refresh: this.props.refresh,
                      event: this.props.event
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
              style={[
                styles.driveButton,
                {
                  backgroundColor: this.isRider || this.isDriver
                    ? colors.disabledPurp
                    : colors.purp
                }
              ]}
            >
              <Text style={styles.driveButtonText}>
                DRIVE
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.driversAvailable}>
            {this.isRider && "You're receiving a ride."}
            {this.isDriver && "You're giving a ride."}
            {!this.isRider &&
              !this.isDriver &&
              this.props.event.availableRides > 0 &&
              `${this.props.event.availableRides} driver${this.props.event.availableRides > 1 ? "s" : ""} available`.toUpperCase()}
            {!this.isRider &&
              !this.isDriver &&
              !this.props.event.availableRides &&
              "No drivers available".toUpperCase()}
          </Text>

          {!this.isDriver &&
            !this.isRider &&
            <TouchableOpacity
              onPress={() => {
                createLyftDeepLink(this.props.event)
                  .then(url => {
                    maybeOpenURL(url, {
                      appName: "Lyft",
                      appStoreId: "id529379082",
                      playStoreId: "me.lyft.android"
                    }).catch(err => {
                      this.props.alertWithType(
                        "error",
                        "Error",
                        err.toString()
                      );
                    });
                  })
                  .catch(err => {
                    this.props.alertWithType("error", "Error", err.toString());
                  });
              }}
              style={styles.lyftButton}
            >
              <Image
                resizeMode="contain"
                style={styles.lyftIcon}
                source={require("pul/assets/images/lyft_logo_white.png")}
              />
              <Text style={styles.lyftButtonText}>
                RIDE WITH LYFT
              </Text>
              <View />
            </TouchableOpacity>}
        </Collapsible>
      </ElevatedView>
    );
  }
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    backgroundColor: "white"
  },
  location: {
    paddingTop: 8,
    fontFamily: "open-sans-semibold",
    fontSize: 12,
    color: colors.blue
  },
  time: {
    fontFamily: "open-sans-semibold",
    fontSize: 12,
    color: colors.black,
    paddingBottom: 4
  },
  description: {
    paddingTop: 4,
    fontFamily: "open-sans",
    fontSize: 14,
    color: colors.black
  },
  website: {
    paddingTop: 8,
    fontFamily: "open-sans-light",
    fontSize: 12,
    color: colors.blue
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8
  },
  rideButton: {
    borderRadius: 4,
    alignItems: "center",
    height: 40,
    backgroundColor: colors.blue,
    flex: 1,
    marginRight: 16,
    justifyContent: "center"
  },
  rideButtonText: {
    fontSize: 18,
    fontFamily: "open-sans-bold",
    color: "white"
  },
  driversAvailable: {
    color: colors.black,
    fontSize: 12,
    alignSelf: "center",
    fontFamily: "open-sans",
    textAlign: "center"
  },
  driveButton: {
    borderRadius: 4,
    flex: 1,
    marginLeft: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    height: 40,
    backgroundColor: colors.purp
  },
  driveButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "open-sans-bold"
  },
  lyftButton: {
    borderRadius: 4,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    marginVertical: 8,
    backgroundColor: colors.lyft
  },
  lyftButtonText: {
    color: "white",
    fontSize: 18,
    marginLeft: -30,
    fontFamily: "open-sans-bold"
  },
  lyftIcon: {
    height: 21,
    width: 30
  }
});
