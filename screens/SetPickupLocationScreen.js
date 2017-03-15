import React, { Component, PropTypes } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ListView,
  ActivityIndicator,
} from 'react-native';
import { NavigationStyles } from '@expo/ex-navigation';
import colors from 'kolors';
import ElevatedView from 'react-native-elevated-view';
import shuffle from '../utils/shuffle';
import connectDropdownAlert from '../utils/connectDropdownAlert';
import {
  isExponentPushToken,
  sendPushNotificationAsync,
} from '../utils/ExponentPushClient';
import { inject, observer } from 'mobx-react/native';
import RadioOption from '../components/RadioOption';
import { observable } from 'mobx';
import _ from 'lodash';
import Suggestion from '../components/styled/Suggestion';
import { email } from 'react-native-communications';

/**
 *  For setting where you want to get picked up as a rider
 */
@connectDropdownAlert
@inject('authStore')
@observer
export default class SetPickupLocationScreen extends Component {
  static route = {
    navigationBar: {
      visible: true,
      title: 'SET PICKUP LOCATION',
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
    authStore: PropTypes.object.isRequired,
    refresh: PropTypes.func,
    alertWithType: PropTypes.func.isRequired,
  };

  @observable location = '';
  @observable pickupLocations = [];
  @observable loading = true;
  @observable submitting = false;

  /**
   *  Called when component is scheduled to render
   */
  componentWillMount() {
    global.firebaseApp
      .database()
      .ref('schools')
      .child(this.props.event.schoolUID)
      .child('pickupLocations')
      .once('value')
      .then(pickupLocationsSnap => {
        this.pickupLocations = _.toArray(pickupLocationsSnap.val());
        this.loading = false;
      })
      .catch(err => {
        this.loading = false;
        this.props.alertWithType('error', 'Error', err.toString());
      });
  }

  ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

  requestRide = () => {
    // add submission check
    if (this.submitting) {
      this.props.alertWithType('info', 'Info', 'Your request is in progress.');
      return;
    }

    this.submitting = true;

    if (this.location === '') {
      this.props.alertWithType('error', 'Error', 'Choose a pickup location.');
      this.submitting = false;
      return;
    }

    const shuffledRides = shuffle(this.props.event.rides.slice());
    shuffledRides.some(ride => {
      if (
        ride.passengers === undefined ||
        ride.passengers.length < ride.passengerLimit
      ) {
        this.loading = true;
        global.firebaseApp
          .database()
          .ref('schools')
          .child(this.props.event.schoolUID)
          .child('events')
          .child(this.props.event.uid)
          .child('rides')
          .child(ride.uid)
          .child('passengers')
          .push({
            userUID: global.firebaseApp.auth().currentUser.uid,
            location: this.location,
            isPickedUp: false,
          })
          .then(() => {
            global.firebaseApp
              .database()
              .ref('users')
              .child(ride.driver)
              .once('value')
              .then(userSnap => {
                const user = userSnap.val();

                if (!__DEV__ && isExponentPushToken(user.pushToken)) {
                  sendPushNotificationAsync({
                    exponentPushToken: user.pushToken,
                    message: `${this.props.authStore.userData.displayName} has joined your ride to ${this.props.event.name}!`,
                  }).catch(err => {
                    this.props.alertWithType('error', 'Error', err.toString());
                  });
                }
              });

            if (Array.isArray(ride.passengers.slice())) {
              ride.passengers.slice().forEach(passenger => {
                global.firebaseApp
                  .database()
                  .ref('users')
                  .child(passenger.userUID)
                  .once('value')
                  .then(userSnap => {
                    const user = userSnap.val();

                    if (!__DEV__ && isExponentPushToken(user.pushToken)) {
                      sendPushNotificationAsync({
                        exponentPushToken: user.pushToken,
                        message: `${this.props.authStore.userData.displayName} has joined your ride to ${this.props.event.name}!`,
                      }).catch(err => {
                        this.props.alertWithType(
                          'error',
                          'Error',
                          err.toString()
                        );
                      });
                    }
                  });
              });
            }

            this.props.alertWithType(
              'success',
              'Success',
              'Thanks for requesting a ride! Make sure to say hello to your driver!'
            );
            this.loading = false;
            this.props.refresh(false);
            this.props.navigator.pop();
          })
          .catch(err => {
            this.loading = false;
            this.props.alertWithType('error', 'Error', err.toString());
          });
        return true;
      }
      return false;
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <Choose>
          <When condition={this.loading}>
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
            <ListView
              enableEmptySections
              style={{ marginTop: 4 }}
              dataSource={this.ds.cloneWithRows(this.pickupLocations.slice())}
              renderRow={location => (
                <RadioOption
                  onPress={() => {
                    this.location = location.name;
                    this.pickupLocations = this.pickupLocations.slice(); // to force rerender
                  }}
                  color={colors.blue}
                  selected={this.location === location.name}
                  label={location.name}
                />
              )}
            />
          </Otherwise>
        </Choose>
        <TouchableOpacity onPress={() => this.requestRide()}>
          <ElevatedView style={styles.requestButton} elevation={4}>
            <Text style={styles.requestButtonText}>
              REQUEST A RIDE
            </Text>
          </ElevatedView>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => email(
            ['datwheat@gmail.com'],
            null,
            null,
            'PÜL Pickup Location Request',
            `Hey!

You should consider adding <SPOT NAME> to PÜL!

Its details are:
  - Name: <SPOT NAME>
  - Location: (<LAT>, <LON>)

(How to find coordinates: https://support.google.com/maps/answer/18539)

Thanks a lot for considering adding <SPOT NAME> to PÜL!

${this.props.authStore.userData.displayName}; School ID: ${this.props.authStore.userData.school}`
          )}
        >
          <Suggestion>Know a better spot?</Suggestion>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  requestButton: {
    height: 64,
    backgroundColor: colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    margin: 16,
  },
  requestButtonText: {
    fontFamily: 'open-sans-bold',
    color: 'white',
    fontSize: 24,
  },
  radioGroupContainer: {},
  radioContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lightGrey,
  },
  buttonLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
