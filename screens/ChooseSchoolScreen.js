import React, { Component, PropTypes } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import colors from "kolors";
import { NavigationStyles } from "@expo/ex-navigation";
import SchoolOption from "../components/SchoolOption";
import connectDropdownAlert from "../utils/connectDropdownAlert";
import { email } from "react-native-communications";
import { observer } from "mobx-react/native";
import { observable, action } from "mobx";
import _ from "lodash";
import Suggestion from "../components/styled/Suggestion";

@connectDropdownAlert
@observer
export default class ChooseSchoolScreen extends Component {
  static route = {
    navigationBar: {
      visible: true,
      title: "CHOOSE YOUR SCHOOL",
      tintColor: colors.black,
      titleStyle: {
        fontFamily: "open-sans-bold"
      },
      backgroundColor: "white"
    },
    styles: {
      ...NavigationStyles.SlideHorizontal
    }
  };

  static propTypes = {
    navigator: PropTypes.object,
    intent: PropTypes.string.isRequired,
    alertWithType: PropTypes.func.isRequired
  };

  @observable loading = true;
  @observable schools = [];

  @action finishLoading = () => {
    this.loading = false;
  };

  @action setSchools = schools => {
    this.schools = schools;
  };

  componentWillMount() {
    global.firebaseApp
      .database()
      .ref("schools")
      .once("value")
      .then(schoolsSnap => {
        this.setSchools(
          _.map(schoolsSnap.val(), (school, uid) => {
            return {
              ...school,
              uid
            };
          })
        );
        this.finishLoading();
      })
      .catch(err => {
        this.props.alertWithType("error", "Error", err.toString());
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Choose>
          <When condition={this.loading}>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <ActivityIndicator size="large" />
            </View>
          </When>
          <Otherwise>
            <FlatList
              data={this.schools.slice()}
              keyExtractor={(item, index) => index}
              renderItem={({ item }) => (
                <SchoolOption intent={this.props.intent} school={item} />
              )}
            />
          </Otherwise>
        </Choose>
        <Choose>
          <When condition={this.props.intent === "signup"}>
            <TouchableOpacity
              onPress={() => {
                email(
                  ["datwheat@gmail.com"],
                  null,
                  null,
                  "PÜL School Request",
                  `Hey!

You should consider adding <SCHOOL NAME> to PÜL!

Our email domain is <EMAIL DOMAIN> (example: '@stpaulsschool.org').

Our hotspots for pickups are:
  1. Name: <NAME>
      Location: (<LAT>, <LON>)
  2. Name: <NAME>
      Location: (<LAT>, <LON>)
  3. Name: <NAME>
      Location: (<LAT>, <LON>)
  4. Name: <NAME>
      Location: (<LAT>, <LON>)

(How to find coordinates: https://support.google.com/maps/answer/18539)

Thanks a lot for considering adding <SCHOOL NAME> to PÜL!

<SENDER NAME>`
                );
              }}
            >
              <Suggestion>
                School not listed?
              </Suggestion>
            </TouchableOpacity>
          </When>
        </Choose>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "space-between"
  }
});
