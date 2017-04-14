import React, { Component, PropTypes } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard
} from "react-native";
import colors from "kolors";
import { NavigationStyles } from "@expo/ex-navigation";
import Router from "Router";
import validator from "validator";
import connectDropdownAlert from "../utils/connectDropdownAlert";
import KeyboardAwareScrollView from "../components/KeyboardAwareScrollView";
import { observer } from "mobx-react/native";
import { observable } from "mobx";

@connectDropdownAlert
@observer
export default class GetEmailScreen extends Component {
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
    navigator: PropTypes.object.isRequired,
    intent: PropTypes.string.isRequired,
    alertWithType: PropTypes.func.isRequired
  };

  @observable emailUsername = "";

  pushToNextScreen = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      // to make sure the keyboard goes down before autofocus on the next screen
      if (!this.emailUsername.trim().length) {
        this.props.alertWithType(
          "error",
          "Error",
          "Email username must be provided."
        );
        return;
      }
      if (validator.isEmail(this.emailUsername.trim())) {
        this.props.alertWithType(
          "error",
          "Error",
          "Supply your email username only."
        );
        return;
      }
      const scene = this.props.intent === "signup" ? "getName" : "getPassword";
      this.props.navigator.push(
        Router.getRoute(scene, {
          school: this.props.school,
          intent: this.props.intent,
          credentials: {
            email: this.emailUsername.toLowerCase().trim() +
              this.props.school.emailSuffix
          }
        })
      );
    }, 10);
  };

  render() {
    return (
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <View />
        <View>
          <Text style={styles.fieldLabel}>Email</Text>
          <View style={styles.assistedTextInputContainer}>
            <TextInput
              autoCorrect={false}
              underlineColorAndroid="transparent"
              style={styles.fieldContents}
              onChangeText={emailUsername => {
                this.emailUsername = emailUsername.trim();
              }}
              value={this.emailUsername}
              placeholder="Username"
              autoFocus
              blurOnSubmit
              returnKeyType="next"
              onSubmitEditing={() => this.pushToNextScreen()}
            />
            <Text style={styles.inputAssist}>
              {this.props.school.emailSuffix}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => this.pushToNextScreen()}
          style={styles.touchable}
        >
          <Text style={styles.touchableText}>Next</Text>
        </TouchableOpacity>
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
  fieldLabel: {
    marginBottom: 8,
    fontFamily: "open-sans-semibold",
    fontSize: 20,
    color: colors.black
  },
  fieldContents: {
    fontFamily: "open-sans",
    height: 40,
    color: colors.black,
    fontSize: 18
  },
  assistedTextInputContainer: {},
  inputAssist: {
    fontFamily: "open-sans",
    fontSize: 16,
    color: colors.black
  },
  touchable: {
    alignSelf: "flex-end"
  },
  touchableText: {
    fontFamily: "open-sans-semibold",
    fontSize: 24,
    color: colors.black
  }
});
