import React, { Component, PropTypes } from "react";
import {
  View,
  ListView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import colors from "../config/colors";
import Carpooler from "../components/Carpooler";
import { connectActionSheet } from "@exponent/react-native-action-sheet";
import { withNavigation } from "@exponent/ex-navigation";
import ElevatedView from "react-native-elevated-view";
import { maybeOpenURL } from "react-native-app-link";
import connectDropdownAlert from "../utils/connectDropdownAlert";
import { observer } from "mobx-react/native";
import { Notifications } from "exponent";

@withNavigation
@connectActionSheet
@connectDropdownAlert
@observer
export default class Ride extends Component {
  static propTypes = {
    event: PropTypes.object.isRequired,
    navigator: PropTypes.object,
    showActionSheetWithOptions: PropTypes.func,
    refresh: PropTypes.func,
    refreshing: PropTypes.bool,
    alertWithType: PropTypes.func.isRequired,
  };

  state = {
    passengers: [],
    pickedUpUsers: 0,
    selfIsDriver: this.props.event.yourRide.driver ===
      global.firebaseApp.auth().currentUser.uid,
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
          type: "driver",
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
                  type: "rider",
                });
                if (pass.isPickedUp) {
                  pickedUpUsers++;
                }
                this.setState(() => {
                  return {
                    passengers,
                    pickedUpUsers,
                  };
                });
              });
          });
        }
        this.setState(() => {
          return {
            passengers,
          };
        });
      })
      .catch(err => {
        this.props.alertWithType("error", "Error", err.toString());
      });
  }

  ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

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
        destructiveButtonIndex,
      },
      buttonIndex => {
        if (buttonIndex === destructiveButtonIndex) {
          if (this.state.selfIsDriver) {
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
                          this.props.event.yourRide.notiID,
                        );
                        this.props.alertWithType(
                          "error",
                          "😢",
                          `You left ${this.props.event.name}.`,
                        );
                        this.props.refresh(false);
                      })
                      .catch(err => {
                        this.props.alertWithType(
                          "error",
                          "Error",
                          err.toString(),
                        );
                      });
                  },
                },
              ],
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
                        i =>
                          i.userUID ===
                          global.firebaseApp.auth().currentUser.uid,
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
                        this.props.event.yourRide.passengers[passIndex].passUID,
                      )
                      .remove()
                      .then(() => {
                        this.props.alertWithType(
                          "error",
                          "😢",
                          `You left ${this.props.event.name}.`,
                        );
                        this.props.refresh(false);
                      })
                      .catch(err => {
                        this.props.alertWithType(
                          "error",
                          "Error",
                          err.toString(),
                        );
                      });
                  },
                },
              ],
            );
          }
        }
        if (buttonIndex === navigateButtonIndex) {
          const wazeUrl = `waze://?ll=${this.props.event.location.geometry.location.lat},` +
            `${this.props.event.location.geometry.location.lng}&z=10&navigate=yes`;
          maybeOpenURL(wazeUrl, {
            appName: "Waze",
            appStoreId: "id323229106",
            playStoreId: "com.waze",
          }).catch(err => {
            this.props.alertWithType("error", "Error", err.toString());
          });
        }
      },
    );
  };

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
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <View style={styles.moreItem} />
            <View style={styles.moreItem} />
            <View style={styles.moreItem} />
          </TouchableOpacity>
        </View>
        <ListView
          enableEmptySections
          dataSource={this.ds.cloneWithRows(this.state.passengers)}
          renderRow={u => (
            <Carpooler
              event={this.props.event}
              refresh={this.props.refresh}
              passengers={this.state.passengers}
              pickedUpUsers={this.state.pickedUpUsers}
              refreshing={this.props.refreshing}
              user={u}
              selfIsDriver={this.state.selfIsDriver}
            />
          )}
        />
        {/* if everyone is pickedUp render 'start driving' button */}
        <Choose>
          <When
            condition={
              this.state.selfIsDriver &&
                !this.props.event.yourRide.rideStarted &&
                this.state.passengers.length > 1 &&
                this.state.pickedUpUsers === this.state.passengers.length - 1
            }>
            <TouchableOpacity
              onPress={() => Alert.alert(
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
                            rideStarted: true,
                          },
                          () => {
                            const wazeUrl = `waze://?ll=${this.props.event.location.geometry.location.lat},` +
                              `${this.props.event.location.geometry.location.lng}&z=10&navigate=yes`;
                            maybeOpenURL(wazeUrl, {
                              appName: "Waze",
                              appStoreId: "id323229106",
                              playStoreId: "com.waze",
                            }).catch(err => {
                              this.props.alertWithType(
                                "error",
                                "Error",
                                err.toString(),
                              );
                            });
                          },
                        )
                        .catch(err => {
                          this.props.alertWithType(
                            "error",
                            "Error",
                            err.toString(),
                          );
                        });
                    },
                  },
                ],
              )}>
              <ElevatedView style={styles.startDrivingButton} elevation={4}>
                <Text style={styles.buttonText}>
                  START DRIVING
                </Text>
              </ElevatedView>
            </TouchableOpacity>
          </When>
          <When
            condition={
              this.state.selfIsDriver &&
                this.props.event.yourRide.rideStarted &&
                !this.props.event.yourRide.rideCompleted
            }>
            <TouchableOpacity
              onPress={() => Alert.alert(
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
                            rideCompleted: true,
                          },
                          () => {
                            this.props.alertWithType(
                              "success",
                              "YEET",
                              "Aye you made it!",
                            );
                          },
                        )
                        .catch(err => {
                          this.props.alertWithType(
                            "error",
                            "Error",
                            err.toString(),
                          );
                        });
                    },
                  },
                ],
              )}>
              <ElevatedView style={styles.rideCompleteButton} elevation={4}>
                <Text style={styles.buttonText}>
                  COMPLETE RIDE
                </Text>
              </ElevatedView>
            </TouchableOpacity>
          </When>
          <When
            condition={
              this.state.selfIsDriver && this.state.passengers.length === 1
            }>
            <Text
              style={{
                fontFamily: "open-sans-semibold",
                fontSize: 18,
                alignSelf: "center",
                paddingTop: 16,
              }}>
              NO PASSENGERS AVAILABLE
            </Text>
          </When>
          <When
            condition={
              this.props.event.yourRide.rideStarted &&
                !this.props.event.yourRide.rideCompleted
            }>
            <Text
              style={{
                fontFamily: "open-sans-semibold",
                fontSize: 18,
                alignSelf: "center",
                paddingTop: 16,
              }}>
              RIDE IN PROGRESS
            </Text>
          </When>
          <When condition={this.props.event.yourRide.rideCompleted}>
            <Text
              style={{
                fontFamily: "open-sans-semibold",
                fontSize: 18,
                alignSelf: "center",
                paddingTop: 16,
              }}>
              RIDE COMPLETED
            </Text>
          </When>
        </Choose>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  label: {
    fontFamily: "open-sans-semibold",
    fontSize: 12,
    color: "rgba(128, 128, 128, 0.7)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 8,
    paddingBottom: 4,
  },
  moreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 24,
  },
  moreItem: {
    backgroundColor: "#546E7A",
    height: 5,
    width: 5,
    borderRadius: 5,
  },
  startDrivingButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginHorizontal: 8,
    paddingVertical: 8,
    marginTop: 8,
    backgroundColor: colors.purp,
  },
  rideCompleteButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginHorizontal: 8,
    paddingVertical: 8,
    marginTop: 8,
    backgroundColor: colors.neonGreen,
  },
  buttonText: {
    fontFamily: "open-sans-bold",
    fontSize: 18,
    color: "white",
  },
});
