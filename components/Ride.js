import React, { Component, PropTypes } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  FlatList
} from "react-native";
import colors from "kolors";
import Carpooler from "../components/Carpooler";
import { connectActionSheet } from "@expo/react-native-action-sheet";
import { withNavigation } from "@expo/ex-navigation";
import ElevatedView from "fiber-react-native-elevated-view";
import { maybeOpenURL } from "react-native-app-link";
import connectDropdownAlert from "../utils/connectDropdownAlert";
import createWazeDeepLink from "../utils/createWazeDeepLink";
import { observer, inject } from "mobx-react/native";
import { observable } from "mobx";
import { Notifications } from "expo";
import RideStatus from "./styled/RideStatus";

@withNavigation
@connectActionSheet
@connectDropdownAlert
@inject("authStore")
@observer
export default class Ride extends Component {
  static propTypes = {
    event: PropTypes.object.isRequired,
    authStore: PropTypes.object.isRequired,
    navigator: PropTypes.object,
    showActionSheetWithOptions: PropTypes.func,
    refresh: PropTypes.func,
    refreshing: PropTypes.bool,
    alertWithType: PropTypes.func.isRequired
  };

  @observable passengers = [];
  @observable pickedUpUsers = 0;
  @observable selfIsDriver = this.props.event.yourRide.driver ===
    this.props.authStore.userId;

  _onOpenActionSheet = () => {
    // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
    const options = ["Leave Ride", "Navigate", "Cancel"];
    const destructiveButtonIndex = 0;
    const navigateButtonIndex = 1;
    const cancelButtonIndex = 2;
    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex
      },
      buttonIndex => {
        if (buttonIndex === destructiveButtonIndex) {
          if (this.selfIsDriver) {
            Alert.alert(
              Platform.OS === "ios" ? "Leave Ride" : "Leave ride",
              "Are you sure? Leaving this ride will strand your passengers. 😢",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "OK",
                  onPress: () => {
                    global.firebaseApp
                      .database()
                      .ref("schools")
                      .child(this.props.event.schoolUID)
                      .child("events")
                      .child(this.props.event.uid)
                      .child("rides")
                      .child(this.props.event.yourRide.uid)
                      .remove()
                      .then(() => {
                        Notifications.cancelScheduledNotificationAsync(
                          this.props.event.yourRide.notiID
                        );
                        this.props.alertWithType(
                          "error",
                          "😢",
                          `You left ${this.props.event.name}.`
                        );
                        this.props.refresh(false);
                      })
                      .catch(err => {
                        this.props.alertWithType(
                          "error",
                          "Error",
                          err.toString()
                        );
                      });
                  }
                }
              ]
            );
          } else {
            Alert.alert(
              Platform.OS === "ios" ? "Leave Ride" : "Leave ride",
              "Are you sure? Leaving this ride so not lit.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "OK",
                  onPress: () => {
                    const passIndex = this.props.event.yourRide.passengers
                      .slice()
                      .findIndex(
                        i => i.userUID === this.props.authStore.userId
                      );
                    global.firebaseApp
                      .database()
                      .ref("schools")
                      .child(this.props.event.schoolUID)
                      .child("events")
                      .child(this.props.event.uid)
                      .child("rides")
                      .child(this.props.event.yourRide.uid)
                      .child("passengers")
                      .child(
                        this.props.event.yourRide.passengers[passIndex].passUID
                      )
                      .remove()
                      .then(() => {
                        this.props.alertWithType(
                          "error",
                          "😢",
                          `You left ${this.props.event.name}.`
                        );
                        this.props.refresh(false);
                      })
                      .catch(err => {
                        this.props.alertWithType(
                          "error",
                          "Error",
                          err.toString()
                        );
                      });
                  }
                }
              ]
            );
          }
        }
        if (buttonIndex === navigateButtonIndex) {
          const wazeUrl = createWazeDeepLink(
            this.props.event.location.geometry.location.lat,
            this.props.event.location.geometry.location.lng
          );

          maybeOpenURL(wazeUrl, {
            appName: "Waze",
            appStoreId: "id323229106",
            playStoreId: "com.waze"
          }).catch(err => {
            this.props.alertWithType("error", "Error", err.toString());
          });
        }
      }
    );
  };

  componentWillMount() {
    const passengers = [];
    let pickedUpUsers = 0;
    global.firebaseApp
      .database()
      .ref("users")
      .child(this.props.event.yourRide.driver)
      .once("value")
      .then(userSnap => {
        passengers.push({
          userUID: this.props.event.yourRide.driver,
          ...userSnap.val(),
          type: "driver"
        });

        // now get other users and push to arr
        if (this.props.event.yourRide.passengers) {
          this.props.event.yourRide.passengers.slice().forEach(pass => {
            global.firebaseApp
              .database()
              .ref("users")
              .child(pass.userUID)
              .once("value")
              .then(passSnap => {
                passengers.push({
                  ...pass,
                  ...passSnap.val(),
                  type: "rider"
                });
                if (pass.isPickedUp) {
                  pickedUpUsers++;
                }
                this.passengers = passengers;
                this.pickedUpUsers = pickedUpUsers;
              });
          });
        }
        this.passengers = passengers;
      })
      .catch(err => {
        this.props.alertWithType("error", "Error", err.toString());
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.label}>
            {this.props.event.name.toUpperCase()}
          </Text>
          <TouchableOpacity
            style={styles.moreContainer}
            onPress={this._onOpenActionSheet}
            // onPress open an action sheet
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <View style={styles.moreItem} />
            <View style={styles.moreItem} />
            <View style={styles.moreItem} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={this.passengers.slice()}
          keyExtractor={(item, index) => index}
          renderItem={({ item }) => (
            <Carpooler
              event={this.props.event}
              refresh={this.props.refresh}
              passengers={this.passengers.slice()}
              pickedUpUsers={this.pickedUpUsers}
              refreshing={this.props.refreshing}
              user={item}
              selfIsDriver={this.selfIsDriver}
            />
          )}
        />
        {/* if everyone is pickedUp render 'start driving' button */}
        <Choose>
          <When
            condition={
              this.selfIsDriver &&
                !this.props.event.yourRide.rideStarted &&
                this.passengers.length > 1 &&
                this.pickedUpUsers === this.passengers.length - 1
            }
          >
            <ElevatedView
              onPress={() =>
                Alert.alert(
                  Platform.OS === "ios" ? "Start Ride" : "Start ride",
                  "Are you sure? Just making sure you didn't click this by mistake.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "OK",
                      onPress: () => {
                        global.firebaseApp
                          .database()
                          .ref("schools")
                          .child(this.props.event.schoolUID)
                          .child("events")
                          .child(this.props.event.uid)
                          .child("rides")
                          .child(this.props.event.yourRide.uid)
                          .update(
                            {
                              rideStarted: true
                            },
                            () => {
                              const wazeUrl = createWazeDeepLink(
                                this.props.event.location.geometry.location.lat,
                                this.props.event.location.geometry.location.lng
                              );

                              maybeOpenURL(wazeUrl, {
                                appName: "Waze",
                                appStoreId: "id323229106",
                                playStoreId: "com.waze"
                              }).catch(err => {
                                this.props.alertWithType(
                                  "error",
                                  "Error",
                                  err.toString()
                                );
                              });
                            }
                          )
                          .catch(err => {
                            this.props.alertWithType(
                              "error",
                              "Error",
                              err.toString()
                            );
                          });
                      }
                    }
                  ]
                )}
              feedbackEnabled
              activeElevation={1}
              style={styles.startDrivingButton}
              elevation={4}
            >
              <Text style={styles.buttonText}>
                START DRIVING
              </Text>
            </ElevatedView>
          </When>
          <When
            condition={
              this.selfIsDriver &&
                this.props.event.yourRide.rideStarted &&
                !this.props.event.yourRide.rideCompleted
            }
          >
            <ElevatedView
              onPress={() =>
                Alert.alert(
                  Platform.OS === "ios" ? "End Ride" : "End ride",
                  "Are you sure? Just making sure you didn't click this by mistake.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "OK",
                      onPress: () => {
                        global.firebaseApp
                          .database()
                          .ref("schools")
                          .child(this.props.event.schoolUID)
                          .child("events")
                          .child(this.props.event.uid)
                          .child("rides")
                          .child(this.props.event.yourRide.uid)
                          .update(
                            {
                              rideCompleted: true
                            },
                            () => {
                              this.props.alertWithType(
                                "success",
                                "YEET",
                                "Aye you made it!"
                              );
                            }
                          )
                          .catch(err => {
                            this.props.alertWithType(
                              "error",
                              "Error",
                              err.toString()
                            );
                          });
                      }
                    }
                  ]
                )}
              style={styles.rideCompleteButton}
              feedbackEnabled
              activeElevation={1}
              elevation={4}
            >
              <Text style={styles.buttonText}>
                COMPLETE RIDE
              </Text>
            </ElevatedView>
          </When>
          <When condition={this.selfIsDriver && this.passengers.length === 1}>
            <RideStatus>
              NO PASSENGERS AVAILABLE
            </RideStatus>
          </When>
          <When
            condition={
              this.props.event.yourRide.rideStarted &&
                !this.props.event.yourRide.rideCompleted
            }
          >
            <RideStatus>
              RIDE IN PROGRESS
            </RideStatus>
          </When>
          <When condition={this.props.event.yourRide.rideCompleted}>
            <RideStatus>
              RIDE COMPLETED
            </RideStatus>
          </When>
        </Choose>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8
  },
  label: {
    fontFamily: "open-sans-semibold",
    fontSize: 12,
    color: "rgba(128, 128, 128, 0.7)"
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 8,
    paddingBottom: 4
  },
  moreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 24
  },
  moreItem: {
    backgroundColor: "#546E7A",
    height: 5,
    width: 5,
    borderRadius: 5
  },
  startDrivingButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginHorizontal: 8,
    paddingVertical: 8,
    marginTop: 8,
    backgroundColor: colors.purp
  },
  rideCompleteButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginHorizontal: 8,
    paddingVertical: 8,
    marginTop: 8,
    backgroundColor: colors.neonGreen
  },
  buttonText: {
    fontFamily: "open-sans-bold",
    fontSize: 18,
    color: "white"
  }
});
