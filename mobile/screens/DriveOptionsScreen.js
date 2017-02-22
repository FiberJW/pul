import React, { Component, PropTypes } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { NavigationStyles } from '@exponent/ex-navigation';
import colors from '../config/colors';
import moment from 'moment';
// import t from 'tcomb-form-native';
// import pickupTimeStylesheet from '../config/pickupTimeStylesheet';
import ElevatedView from 'react-native-elevated-view';
import connectDropdownAlert from '../utils/connectDropdownAlert';

// const Form = t.form.Form;

// const Time = t.struct({
//   time: t.Date,
// });
//
// const TimeOptions = {
//   auto: 'none',
//   fields: {
//     time: {
//       stylesheet: pickupTimeStylesheet,
//       config: {
//         format: time => moment(time).format('h:mma'),
//       },
//       mode: 'time',
//     },
//   },
// };

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
  }

  static propTypes = {
    navigator: PropTypes.object.isRequired,
    navigation: PropTypes.object.isRequired,
    event: PropTypes.object.isRequired,
    refresh: PropTypes.func,
    alertWithType: PropTypes.func.isRequired,
  }

  state = {
    passengerLimit: 1,
    submitting: false,
    pickupTime: moment().toDate().getTime(),
  }

  timeIsValid = () => {
    const date = moment(this.props.event.date).startOf('day');
    const pickupDate = moment(date);
    const pickupHours = this.state.pickupTime.time ?
      moment(this.state.pickupTime.time).hours() :
      moment(this.state.pickupTime).hours();

    const pickUpMinutes = this.state.pickupTime.time
      ? moment(this.state.pickupTime.time).minutes() :
      moment(this.state.pickupTime).minutes();

    const pickupDatePlusHours = moment(pickupDate).add(pickupHours, 'hours');
    const completePickupMoment = moment(pickupDatePlusHours).add(pickUpMinutes, 'minutes');

    const addedHours = moment(date).add(this.props.event.time.hours, 'hours');
    const completeEventMoment = moment(addedHours).add(this.props.event.time.minutes, 'minutes');
    return completePickupMoment.isBefore(completeEventMoment);
  }

  createRide = () => {
    // const pickupTime = {
    //   hours: this.state.pickupTime.time ? moment(this.state.pickupTime.time).hours() : moment(this.state.pickupTime).hours(),
    //   minutes: this.state.pickupTime.time ? moment(this.state.pickupTime.time).minutes() : moment(this.state.pickupTime).minutes(),
    // };

    return {
      eventUID: this.props.event.uid,
      schoolUID: this.props.event.schoolUID,
      // pickupTime,
      pickupStarted: false,
      pickupCompleted: false,
      rideStarted: false,
      rideCompleted: false,
      reminderSet: false,
      passengerLimit: this.state.passengerLimit,
      driver: global.firebaseApp.auth().currentUser.uid,
    };
  }

  pushRide = () => {
    // if (!this.timeIsValid()) {
    //   this.props.alertWithType('error', 'Error', 'Your pickup time is invalid.');
    //   return;
    // }
    if (this.state.submitting) {
      this.props.alertWithType('info', 'Info', 'Your submission is in progress.');
      return;
    }

    this.setState(() => {
      return { submitting: true };
    });

    global.firebaseApp.database().ref('schools')
      .child(this.props.event.schoolUID)
      .child('events')
      .child(this.props.event.uid)
      .child('rides')
      .push(this.createRide())
      .then(() => {
        Alert.alert(
          null,
          'Thanks for offering a ride!',
          [{ text: 'OK' }]
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
  }

  render() {
    return (
      <Choose>
        <When condition={ this.state.submiting }>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        </When>
        <Otherwise>
          <ScrollView style={ styles.container }>
            <View style={ styles.headerRow }>
              <Text style={ styles.header }>
                PASSENGER LIMIT
              </Text>
            </View>
            <View style={ styles.radioGroupContainer }>
              <TouchableOpacity
                style={ styles.radioContainer }
                onPress={ () => this.setState(() => {
                  return { passengerLimit: 1 };
                }) }
              >
                <View style={ styles.buttonLabelContainer }>
                  <View style={ styles.outerCircle }>
                    { !!(this.state.passengerLimit === 1) && <View style={ styles.innerCircle } /> }
                  </View>
                  <Text style={ styles.label }>1</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={ styles.radioContainer }
                onPress={ () => this.setState(() => {
                  return { passengerLimit: 2 };
                }) }
              >
                <View style={ styles.buttonLabelContainer }>
                  <View style={ styles.outerCircle }>
                    { !!(this.state.passengerLimit === 2) && <View style={ styles.innerCircle } /> }
                  </View>
                  <Text style={ styles.label }>2</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={ styles.radioContainer }
                onPress={ () => this.setState(() => {
                  return { passengerLimit: 3 };
                }) }
              >
                <View style={ styles.buttonLabelContainer }>
                  <View style={ styles.outerCircle }>
                    { !!(this.state.passengerLimit === 3) && <View style={ styles.innerCircle } /> }
                  </View>
                  <Text style={ styles.label }>3</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={ styles.radioContainer }
                onPress={ () => this.setState(() => {
                  return { passengerLimit: 4 };
                }) }
              >
                <View style={ styles.buttonLabelContainer }>
                  <View style={ styles.outerCircle }>
                    { !!(this.state.passengerLimit === 4) && <View style={ styles.innerCircle } /> }
                  </View>
                  <Text style={ styles.label }>4</Text>
                </View>
              </TouchableOpacity>
            </View>
            {/* <View style={ styles.headerRow }>
              <Text style={ styles.header }>
                PICKUP TIME
              </Text>
            </View>
            <Form
              { ...this.props }
              type={ Time }
              ref={ r => { this.time = r; } }
              value={ this.state.pickupTime }
              onChange={ (pickupTime) => {
                this.setState(() => {
                  return {
                    pickupTime,
                  };
                });
              } }
              options={ TimeOptions }
            /> */}
            <TouchableOpacity
              onPress={ () => this.pushRide() }
            >
              <ElevatedView
                elevation={ 4 }
                style={ styles.confirmButton }
              >
                <Text style={ styles.confirmButtonText }>
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
    // justifyContent: 'space-between',
    backgroundColor: colors.eggshell,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  header: {
    fontFamily: 'open-sans-bold',
    fontSize: 12,
    color: colors.stardust,
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
  radioGroupContainer: {},
  radioContainer: {
    padding: 16,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lightGrey,
  },
  outerCircle: {
    height: 24,
    width: 24,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderColor: colors.purp,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    height: 16,
    width: 16,
    backgroundColor: colors.purp,
    borderRadius: 8,
  },
  buttonLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: 16,
    fontFamily: 'open-sans',
    fontSize: 18,
    color: colors.black,
  },
});
