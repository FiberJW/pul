import React, { Component, PropTypes } from "react";
import {
  View,
  ScrollView,
  Text,
  Alert,
  AsyncStorage,
  StyleSheet,
  Switch,
  Platform,
  TouchableOpacity
} from "react-native";
import colors from "kolors";
import { Notifications, Permissions } from "expo";
import { NavigationStyles } from "@expo/ex-navigation";
import Router from "../navigation/Router";
import { observer, inject } from "mobx-react/native";
import { observable } from "mobx";
import connectDropdownAlert from "../utils/connectDropdownAlert";
import { email } from "react-native-communications";
import SettingsLabel from "../components/styled/SettingsLabel";
import SettingsTextInput from "../components/styled/SettingsTextInput";

@connectDropdownAlert
@inject("authStore", "eventStore", "trexStore")
@observer
export default class SettingsScreen extends Component {
  static route = {
    styles: {
      ...NavigationStyles.Fade
    }
  };
  static propTypes = {
    navigator: PropTypes.object,
    navigation: PropTypes.object,
    alertWithType: PropTypes.func.isRequired,
    eventStore: PropTypes.object,
    trexStore: PropTypes.object,
    authStore: PropTypes.object
  };

  @observable user = {};
  @observable notifications = false;

  getUser = () => {
    global.firebaseApp
      .database()
      .ref("users")
      .child(this.props.authStore.userId)
      .once("value")
      .then(userSnap => {
        this.user = userSnap.val();
        this.notifications = this.user.settings.notifications;
      })
      .catch(err => {
        this.props.alertWithType("error", "Error", err.toString());
      });
  };

  togglePushNotifications = value => {
    Permissions.askAsync(Permissions.REMOTE_NOTIFICATIONS)
      .then(({ status }) => {
        if (status === "granted") {
          Notifications.getExponentPushTokenAsync().then(token => {
            this.notifications = value;
            global.firebaseApp
              .database()
              .ref("users")
              .child(this.props.authStore.userId)
              .update({
                pushToken: token,
                settings: {
                  notifications: value
                }
              })
              .then(() => {
                this.getUser();
              })
              .catch(error => {
                this.notifications = !value;
                this.props.alertWithType("error", "Error", error.toString());
              });
          });
        } else {
          this.notifications = !value;
          this.props.alertWithType(
            "error",
            "Error",
            "To stay in the loop, you need to enable push notifications."
          );
        }
      })
      .catch(() => {
        this.notifications = !value;
      });
  };

  componentWillMount() {
    this.getUser();
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeaderText}>ACCOUNT</Text>
            <View style={styles.sectionHeaderUnderline} />
          </View>
          <View style={styles.fieldContainer}>
            <SettingsLabel>Name</SettingsLabel>
            <SettingsTextInput
              editable
              autoCorrect={false}
              underlineColorAndroid="transparent"
              onChangeText={displayName => {
                this.user = {
                  ...this.user,
                  displayName
                };
                if (displayName.trim().length < 4) {
                  this.props.alertWithType(
                    "error",
                    "Error",
                    "Please enter your full name."
                  );
                  return;
                }
                global.firebaseApp
                  .auth()
                  .currentUser.updateProfile({
                    displayName: displayName.trim()
                  })
                  .then(() => {
                    global.firebaseApp
                      .database()
                      .ref("users")
                      .child(this.props.authStore.userId)
                      .update({
                        displayName: displayName.trim()
                      });
                  })
                  .catch(error => {
                    this.props.alertWithType(
                      "error",
                      "Error",
                      error.toString()
                    );
                  });
              }}
              onEndEditing={this.getUser}
              value={this.user.displayName}
            />
          </View>
          <View style={styles.fieldContainer}>
            <SettingsLabel>Phone number</SettingsLabel>
            <SettingsTextInput
              autoCorrect={false}
              onEndEditing={this.getUser}
              underlineColorAndroid="transparent"
              onChangeText={phoneNumber => {
                this.user = {
                  ...this.user,
                  phoneNumber
                };
                if (phoneNumber.trim().length !== 10) {
                  this.props.alertWithType(
                    "error",
                    "Error",
                    "Please enter your 10-digit phone number."
                  );
                  return;
                }
                global.firebaseApp
                  .database()
                  .ref("users")
                  .child(this.props.authStore.userId)
                  .update({
                    phoneNumber: phoneNumber.trim()
                  })
                  .catch(error => {
                    this.props.alertWithType(
                      "error",
                      "Error",
                      error.toString()
                    );
                  });
              }}
              value={this.user.phoneNumber}
            />
          </View>
          <View style={styles.switchFieldContainer}>
            <TouchableOpacity
              onPress={() => this.togglePushNotifications(!this.notifications)}
            >
              <SettingsLabel>Push notifications</SettingsLabel>
            </TouchableOpacity>
            <Switch
              onTintColor={
                Platform.OS === "ios" ? colors.blue : colors.mayaBlue
              }
              thumbTintColor={
                Platform.OS === "android" && this.notifications
                  ? colors.blue
                  : null
              }
              onValueChange={this.togglePushNotifications}
              value={this.notifications}
            />
          </View>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              email(
                ["datwheat@gmail.com"],
                null,
                null,
                `PÜL Feedback <${this.props.authStore.userId}>`,
                null
              );
            }}
            style={styles.fieldContainer}
          >
            <SettingsLabel>Send feedback</SettingsLabel>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                Platform.OS === "ios" ? "Log Out" : "Log out",
                "Are you sure? Logging out will remove all PÜL data from this device.",
                [
                  {
                    text: "Cancel",
                    onPress: () => {},
                    style: "cancel"
                  },
                  {
                    text: "OK",
                    onPress: () => {
                      this.props.authStore
                        .logout()
                        .then(() => {
                          this.props.navigation
                            .getNavigator("master")
                            .immediatelyResetStack(
                              [Router.getRoute("entry")],
                              0
                            );
                          this.props.eventStore.reset();
                          this.props.trexStore.reset();
                          AsyncStorage.clear();
                        })
                        .catch(error => {
                          this.props.alertWithType(
                            "error",
                            "Error",
                            error.toString()
                          );
                        });
                    }
                  }
                ]
              );
            }}
            style={styles.fieldContainer}
          >
            <SettingsLabel>Log out</SettingsLabel>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.eggshell,
    paddingHorizontal: 16,
    justifyContent: "space-between",
    paddingVertical: 16
  },
  sectionHeaderContainer: {
    paddingBottom: 16
  },
  sectionHeaderText: {
    fontFamily: "open-sans-bold",
    fontSize: 16,
    color: colors.blue
  },
  sectionHeaderUnderline: {
    marginTop: 8,
    height: 2,
    borderRadius: 4,
    backgroundColor: colors.blue
  },
  fieldContainer: {
    paddingBottom: 16
  },
  switchFieldContainer: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  }
});
