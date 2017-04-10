import React, { Component, PropTypes } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Dimensions
} from "react-native";
import { LinearGradient } from "expo";
import Router from "../navigation/Router";

export default class EntryScreen extends Component {
  static propTypes = {
    navigator: PropTypes.object
  };

  render() {
    return (
      <LinearGradient style={styles.container} colors={["#D500F9", "#007AFF"]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.innerContainer}>
          <Image
            resizeMode="contain"
            style={styles.logo}
            source={require("pul/assets/images/pul_logo_white.png")}
          />
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>
              Bringing your school community closer, one ride at a time.
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            this.props.navigator.push(
              Router.getRoute("chooseSchool", { intent: "signup" })
            );
          }}
          style={styles.buttonContainer}
        >
          <Text style={styles.buttonText}>GET STARTED</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this.props.navigator.push(
              Router.getRoute("chooseSchool", { intent: "login" })
            );
          }}
          style={styles.loginContainer}
        >
          <Text style={styles.loginText}>
            Have an account? Log in!
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center"
  },
  innerContainer: {
    paddingTop: 100,
    justifyContent: "space-between",
    alignItems: "center"
  },
  logo: {
    height: 72,
    width: 181.19
  },
  taglineContainer: {
    paddingTop: 32,
    alignItems: "center",
    paddingHorizontal: 16
  },
  tagline: {
    fontFamily: "open-sans-light",
    fontSize: 18,
    color: "white",
    textAlign: "center",
    backgroundColor: "transparent"
  },
  buttonContainer: {
    backgroundColor: "transparent",
    borderColor: "white",
    borderWidth: 1,
    width: 200,
    borderRadius: 100,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center"
  },
  buttonText: {
    fontFamily: "open-sans",
    color: "white",
    fontSize: 20
  },
  loginContainer: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    paddingVertical: 16,
    width: Dimensions.get("window").width,
    justifyContent: "center",
    alignItems: "center"
  },
  loginText: {
    fontFamily: "open-sans-light",
    color: "white",
    fontSize: 16
  }
});
