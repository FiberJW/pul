import React, { Component, PropTypes } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet
} from "react-native";
import { NavigationStyles } from "@expo/ex-navigation";
import colors from "kolors";
import moment from "moment";
import t from "tcomb-form-native";
import pickupTimeStylesheet from "../config/pickupTimeStylesheet";
import ElevatedView from "fiber-react-native-elevated-view";
import connectDropdownAlert from "../utils/connectDropdownAlert";
import { Notifications } from "expo";
import {
  isExponentPushToken,
  sendPushNotificationAsync
} from "../utils/ExponentPushClient";
import _ from "lodash";
import RadioOption from "../components/RadioOption";
import WidgetLabel from "../components/styled/WidgetLabel";
import { observable } from "mobx";
import { observer, inject } from "mobx-react/native";

const Form = t.form.Form;

const Time = t.struct({
  time: t.Date
});

const TimeOptions = {
  auto: "none",
  fields: {
    time: {
      stylesheet: pickupTimeStylesheet,
      config: {
        format: time => moment(time).format("h:mma")
      },
      mode: "time"
    }
  }
};

@connectDropdownAlert
@inject("authStore")
@observer
export default class DriveOptionsScreen extends Component {
  static route = {
    navigationBar: {
      visible: true,
      title: "DRIVE OPTIONS",
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
    navigator: PropTypes.object.isRequired,
    navigation: PropTypes.object.isRequired,
    event: PropTypes.object.isRequired,
    authStore: PropTypes.object.isRequired,
    refresh: PropTypes.func,
    alertWithType: PropTypes.func.isRequired
  };

  @observable references = {};
  @observable passengerLimit = 1;
  @observable numPassengerOptions = _.range(4);
  @observable submitting = false;
  @observable pickupTime = moment().toDate().getTime();

  timeIsValid = () => {
    const date = moment(this.props.event.date).startOf("day");
    const pickupDate = moment(date);
    const pickupHours = this.pickupTime.time
      ? moment(this.pickupTime.time).hours()
      : moment(this.pickupTime).hours();

    const pickUpMinutes = this.pickupTime.time
      ? moment(this.pickupTime.time).minutes()
      : moment(this.pickupTime).minutes();

    const pickupDatePlusHours = moment(pickupDate).add(pickupHours, "hours");
    const completePickupMoment = moment(pickupDatePlusHours).add(
      pickUpMinutes,
      "minutes"
    );

    const addedHours = moment(date).add(this.props.event.time.hours, "hours");
    const completeEventMoment = moment(addedHours).add(
      this.props.event.time.minutes,
      "minutes"
    );
    return completePickupMoment.isBefore(completeEventMoment);
  };

  createRide = () => {
    const pickupTime = {
      hours: this.pickupTime.time
        ? moment(this.pickupTime.time).hours()
        : moment(this.pickupTime).hours(),
      minutes: this.pickupTime.time
        ? moment(this.pickupTime.time).minutes()
        : moment(this.pickupTime).minutes()
    };

    return {
      eventUID: this.props.event.uid,
      schoolUID: this.props.event.schoolUID,
      pickupTime,
      rideStarted: false,
      rideCompleted: false,
      passengerLimit: this.passengerLimit,
      driver: this.props.authStore.userId
    };
  };

  pushRide = () => {
    if (!this.timeIsValid()) {
      this.props.alertWithType(
        "error",
        "Error",
        "Your pickup time is invalid."
      );
      return;
    }
    if (this.submitting) {
      this.props.alertWithType(
        "info",
        "Info",
        "Your submission is in progress."
      );
      return;
    }

    this.submitting = true;

    global.firebaseApp
      .database()
      .ref("schools")
      .child(this.props.event.schoolUID)
      .child("events")
      .child(this.props.event.uid)
      .child("rides")
      .push(this.createRide())
      .then(ride => {
        const pickupTime = this.pickupTime.time
          ? moment(this.pickupTime.time)
          : moment(this.pickupTime);

        Notifications.scheduleLocalNotificationAsync(
          {
            title: "Time to pickup your passengers!",
            body: `Pickup your riders for ${this.props.event.name}`
          },
          { time: pickupTime.subtract(30, "minutes").toDate() }
        ).then(notiID => {
          ride.update({
            notiID
          });
        });

        global.firebaseApp
          .database()
          .ref("users")
          .once("value")
          .then(usersSnap => {
            _.each(usersSnap.val(), user => {
              if (
                !global.__DEV__ &&
                isExponentPushToken(user.pushToken) &&
                user.school === this.props.event.schoolUID
              ) {
                sendPushNotificationAsync({
                  exponentPushToken: user.pushToken,
                  message: `There's a new driver for ${this.props.event.name}!`
                }).catch(err => {
                  this.props.alertWithType("error", "Error", err.toString());
                });
              }
            });
          });

        this.props.alertWithType(
          "success",
          "Success",
          "Thanks for offering a ride!"
        );
        this.props.navigator.pop();
        this.props.refresh(false);
      })
      .catch(err => {
        this.submitting = false;
        this.props.alertWithType("error", "Error", err.toString());
      });
  };

  render() {
    return (
      <Choose>
        <When condition={this.submitting}>
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
        <Otherwise>
          <ScrollView style={styles.container}>
            <WidgetLabel label="PASSENGER LIMIT" />
            <View>
              {this.numPassengerOptions.map(n => (
                <RadioOption
                  key={n}
                  onPress={() => {
                    this.passengerLimit = n + 1;
                  }}
                  color={colors.purp}
                  selected={this.passengerLimit === n + 1}
                  label={`${n + 1}`}
                />
              ))}
            </View>
            <WidgetLabel label="PICKUP TIME" />
            <Form
              {...this.props}
              type={Time}
              ref={r => {
                this.references.time = r;
              }}
              value={this.pickupTime}
              onChange={pickupTime => {
                this.pickupTime = pickupTime;
              }}
              options={TimeOptions}
            />
            <ElevatedView
              feedbackEnabled
              activeElevation={1}
              onPress={() => this.pushRide()}
              elevation={4}
              style={styles.confirmButton}
            >
              <Text style={styles.confirmButtonText}>
                CONFIRM DRIVE
              </Text>
            </ElevatedView>
          </ScrollView>
        </Otherwise>
      </Choose>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.eggshell
  },
  confirmButton: {
    height: 64,
    backgroundColor: colors.purp,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    margin: 16
  },
  confirmButtonText: {
    fontFamily: "open-sans-bold",
    color: "white",
    fontSize: 24
  }
});
