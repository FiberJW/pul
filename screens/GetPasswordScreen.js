import React, { Component, PropTypes } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  AsyncStorage,
  Platform,
  TextInput,
  Keyboard,
  Alert,
  ActivityIndicator
} from "react-native";
import colors from "kolors";
import { NavigationStyles } from "@expo/ex-navigation";
import Router from "Router";
import Icon from "../components/CrossPlatformIcon";
import connectDropdownAlert from "../utils/connectDropdownAlert";
import KeyboardAwareScrollView from "../components/KeyboardAwareScrollView";
import { observer, inject } from "mobx-react/native";
import { observable } from "mobx";

@connectDropdownAlert
@inject("authStore")
@observer
export default class GetPasswordScreen extends Component {
  static route = {
    navigationBar: {
      visible: true,
      tintColor: colors.black,
      borderBottomColor: "transparent",
      backgroundColor: "white"
    },
    styles: {
      ...NavigationStyles.SlideHorizontal
    }
  };

  static propTypes = {
    school: PropTypes.object.isRequired,
    credentials: PropTypes.object.isRequired,
    authStore: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    intent: PropTypes.string.isRequired,
    alertWithType: PropTypes.func.isRequired
  };

  @observable password = "";
  @observable loggingIn = false;
  @observable checkedPassword = false;
  @observable visible = false;

  pushToNextScreen = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      // to make sure the keyboard goes down before autofocus on the next screen
      if (this.loggingIn) {
        return;
      }
      this.loggingIn = true;
      if (this.password.length < 6) {
        this.loggingIn = false;
        this.props.alertWithType(
          "error",
          "Error",
          "Password must be at least 6 characters long."
        );
        return;
      }

      if (this.props.intent === "signup" && !this.checkedPassword) {
        this.props.alertWithType(
          "success",
          "",
          "Make sure you've created a memorable password!"
        );
        this.checkedPassword = true;
        this.loggingIn = false;
        return;
      }

      if (this.props.intent === "signup") {
        this.props.authStore
          .signup({
            password: this.password,
            school: this.props.school,
            ...this.props.credentials
          })
          .then(() => {
            this.props.navigator.immediatelyResetStack(
              [Router.getRoute("tabs")],
              0
            );
            setTimeout(() => {
              this.props.alertWithType(
                "info",
                "Info",
                "Make sure to enable push notifications to stay in the loop!"
              );
            }, 5000);
          })
          .catch(error => {
            this.loggingIn = false;
            this.props.alertWithType("error", "Error", error.toString());
          });
      } else {
        this.props.authStore
          .login({
            ...this.props.credentials,
            password: this.password
          })
          .then(() => {
            try {
              AsyncStorage.setItem(
                "@PUL:user",
                JSON.stringify({
                  ...this.props.credentials,
                  password: this.password
                })
              );
            } catch (error) {
              this.props.alertWithType("error", "Error", error.toString());
            }
            this.props.navigator.immediatelyResetStack(
              [Router.getRoute("tabs")],
              0
            );
            setTimeout(() => {
              this.props.alertWithType(
                "info",
                "Info",
                "Make sure to enable push notifications to stay in the loop!"
              );
            }, 5000);
          })
          .catch(error => {
            this.loggingIn = false;
            this.props.alertWithType("error", "Error", error.toString());
          });
      }
    }, 10);
  };

  render() {
    return (
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <View />
        <Choose>
          <When condition={this.loggingIn}>
            <ActivityIndicator size="large" />
          </When>
          <Otherwise>
            <View>
              <View style={styles.assistedTextInputContainer}>
                <TextInput
                  autoCorrect={false}
                  underlineColorAndroid="transparent"
                  secureTextEntry={!this.visible}
                  autoFocus
                  style={styles.fieldContents}
                  onChangeText={password => {
                    this.password = password.trim();
                  }}
                  blurOnSubmit
                  returnKeyType="done"
                  onSubmitEditing={() => this.pushToNextScreen()}
                  value={this.password}
                  placeholder="Password"
                />
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    this.visible = !this.visible;
                  }}
                >
                  <Icon
                    name="eye"
                    size={24}
                    color={!this.visible ? colors.grey : colors.black}
                  />
                </TouchableOpacity>
              </View>
              <Choose>
                <When condition={this.props.intent === "login"}>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        Platform.OS === "ios"
                          ? "Reset Password"
                          : "Reset password",
                        "Send a password reset email to your email address.",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "OK",
                            onPress: () => {
                              this.props.authStore.sendPasswordResetEmail(
                                this.props.credentials.email
                              );
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.resetPassword}>Forgot it?</Text>
                  </TouchableOpacity>
                </When>
              </Choose>
            </View>
          </Otherwise>
        </Choose>
        <Choose>
          <When condition={this.loggingIn}>
            <Text style={styles.statusText}>
              {this.props.intent === "signup"
                ? "Signup in progress..."
                : "Logging in..."}
            </Text>
          </When>
          <Otherwise>
            <TouchableOpacity
              onPress={() => this.pushToNextScreen()}
              style={styles.touchable}
            >
              <Text style={styles.touchableText}>Done</Text>
            </TouchableOpacity>
          </Otherwise>
        </Choose>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  fieldContents: {
    fontFamily: "open-sans",
    height: 40,
    width: Dimensions.get("window").width * 0.60,
    color: colors.black,
    fontSize: 18
  },
  assistedTextInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  touchable: {
    alignSelf: "flex-end"
  },
  touchableText: {
    fontFamily: "open-sans-semibold",
    fontSize: 24,
    color: colors.black
  },
  statusText: {
    alignSelf: "flex-end",
    fontFamily: "open-sans-semibold",
    fontSize: 24,
    color: colors.black
  },
  resetPassword: {
    fontFamily: "open-sans",
    fontSize: 14,
    color: colors.black
  }
});
