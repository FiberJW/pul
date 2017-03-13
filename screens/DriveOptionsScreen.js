import React, { Component, PropTypes } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { NavigationStyles } from '@expo/ex-navigation';
import colors from 'kolors';
import moment from 'moment';
import t from 'tcomb-form-native';
import pickupTimeStylesheet from '../config/pickupTimeStylesheet';
import ElevatedView from 'react-native-elevated-view';
import connectDropdownAlert from '../utils/connectDropdownAlert';
import { Notifications } from 'expo';
import {
  isExponentPushToken,
  sendPushNotificationAsync,
} from '../utils/ExponentPushClient';
import _ from 'lodash';
import RadioOption from '../components/RadioOption';
import WidgetLabel from '../components/styled/WidgetLabel';

const Form = t.form.Form;

const Time = t.struct({
  time: t.Date,
});

const TimeOptions = {
  auto: 'none',
  fields: {
    time: {
      stylesheet: pickupTimeStylesheet,
      config: {
        format: time => moment(time).format('h:mma'),
      },
      mode: 'time',
    },
  },
};

@connectDropdownAlert
export default class DriveOptionsScreen extends Component {
  static route = {
    navigationBar: {
      visible: true,
      title: 'DRIVE OPTIONS',
      tintColor: colors.black,
      titleStyle: {
        fontFamily: 'open-sans-bold',
      },
      backgroundColor: 'white',
    },
    styles: {
      ...NavigationStyles.SlideHorizontal,
    },
  };

  static propTypes = {
    navigator: PropTypes.object.isRequired,
    navigation: PropTypes.object.isRequired,
    event: PropTypes.object.isRequired,
    refresh: PropTypes.func,
    alertWithType: PropTypes.func.isRequired,
  };

  state = {
    passengerLimit: 1,
    numPassengerOptions: _.range(4),
    submitting: false,
    pickupTime: moment().toDate().getTime(),
  };

  timeIsValid = () => {
    const date = moment(this.props.event.date).startOf('day');
    const pickupDate = moment(date);
    const pickupHours = this.state.pickupTime.time
      ? moment(this.state.pickupTime.time).hours()
      : moment(this.state.pickupTime).hours();

    const pickUpMinutes = this.state.pickupTime.time
      ? moment(this.state.pickupTime.time).minutes()
      : moment(this.state.pickupTime).minutes();

    const pickupDatePlusHours = moment(pickupDate).add(pickupHours, 'hours');
    const completePickupMoment = moment(pickupDatePlusHours).add(
      pickUpMinutes,
      'minutes',
    );

    const addedHours = moment(date).add(this.props.event.time.hours, 'hours');
    const completeEventMoment = moment(addedHours).add(
      this.props.event.time.minutes,
      'minutes',
    );
    return completePickupMoment.isBefore(completeEventMoment);
  };

  createRide = () => {
    const pickupTime = {
      hours: this.state.pickupTime.time
        ? moment(this.state.pickupTime.time).hours()
        : moment(this.state.pickupTime).hours(),
      minutes: this.state.pickupTime.time
        ? moment(this.state.pickupTime.time).minutes()
        : moment(this.state.pickupTime).minutes(),
    };

    return {
      eventUID: this.props.event.uid,
      schoolUID: this.props.event.schoolUID,
      pickupTime,
      rideStarted: false,
      rideCompleted: false,
      passengerLimit: this.state.passengerLimit,
      driver: global.firebaseApp.auth().currentUser.uid,
    };
  };

  pushRide = () => {
    if (!this.timeIsValid()) {
      this.props.alertWithType(
        'error',
        'Error',
        'Your pickup time is invalid.',
      );
      return;
    }
    if (this.state.submitting) {
      this.props.alertWithType(
        'info',
        'Info',
        'Your submission is in progress.',
      );
      return;
    }

    this.setState(() => {
      return { submitting: true };
    });

    global.firebaseApp
      .database()
      .ref('schools')
      .child(this.props.event.schoolUID)
      .child('events')
      .child(this.props.event.uid)
      .child('rides')
      .push(this.createRide())
      .then(ride => {
        const pickupTime = this.state.pickupTime.time
          ? moment(this.state.pickupTime.time)
          : moment(this.state.pickupTime);

        Notifications.scheduleLocalNotificationAsync(
          {
            title: 'Time to pickup your passengers!',
            body: `Pickup your riders for ${this.props.event.name}`,
          },
          { time: pickupTime.subtract(30, 'minutes').toDate() },
        ).then(notiID => {
          ride.update({
            notiID,
          });
        });

        global.firebaseApp
          .database()
          .ref('users')
          .once('value')
          .then(usersSnap => {
            _.each(usersSnap.val(), user => {
              if (
                !__DEV__ &&
                isExponentPushToken(user.pushToken) &&
                user.school === this.props.event.schoolUID
              ) {
                sendPushNotificationAsync({
                  exponentPushToken: user.pushToken,
                  message: `There's a new driver for ${this.props.event.name}!`,
                }).catch(err => {
                  this.props.alertWithType('error', 'Error', err.toString());
                });
              }
            });
          });

        this.props.alertWithType(
          'success',
          'Success',
          'Thanks for offering a ride!',
        );
        this.props.navigator.pop();
        this.props.refresh(false);
      })
      .catch(err => {
        this.setState(() => {
          return { submitting: false };
        });
        this.props.alertWithType('error', 'Error', err.toString());
      });
  };

  render() {
    return (
      <Choose>
        <When condition={this.state.submiting}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}>
            <ActivityIndicator size="large" />
          </View>
        </When>
        <Otherwise>
          <ScrollView style={styles.container}>
            <WidgetLabel label="PASSENGER LIMIT" />
            <View>
              {this.state.numPassengerOptions.map(n => (
                <RadioOption
                  key={n}
                  onPress={() => this.setState(() => {
                    return { passengerLimit: n + 1 };
                  })}
                  color={colors.purp}
                  selected={this.state.passengerLimit === n + 1}
                  label={`${n + 1}`}
                />
              ))}
            </View>
            <WidgetLabel label="PICKUP TIME" />
            <Form
              {...this.props}
              type={Time}
              ref={r => {
                this.time = r;
              }}
              value={this.state.pickupTime}
              onChange={pickupTime => {
                this.setState(() => {
                  return {
                    pickupTime,
                  };
                });
              }}
              options={TimeOptions}
            />
            <TouchableOpacity onPress={() => this.pushRide()}>
              <ElevatedView elevation={4} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>
                  CONFIRM DRIVE
                </Text>
              </ElevatedView>
            </TouchableOpacity>
          </ScrollView>
        </Otherwise>
      </Choose>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.eggshell,
  },
  confirmButton: {
    height: 64,
    backgroundColor: colors.purp,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    margin: 16,
  },
  confirmButtonText: {
    fontFamily: 'open-sans-bold',
    color: 'white',
    fontSize: 24,
  },
});
