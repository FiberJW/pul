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

  state = {
    location: '',
    pickupLocations: [],
    loading: true,
    submitting: false,
  };

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
      .then(pulSnap => {
        const pickupLocations = Object.keys(pulSnap.val()).map(key => {
          return pulSnap.val()[key];
        });
        this.setState(() => {
          return {
            pickupLocations,
            loading: false,
          };
        });
      })
      .catch(err => {
        this.setState(() => {
          return {
            loading: false,
          };
        });
        this.props.alertWithType('error', 'Error', err.toString());
      });
  }

  ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

  renderOption = location => {
    return (
      <RadioOption
        onPress={() => this.setState(() => {
          return { location: location.name };
        })}
        color={colors.blue}
        selected={this.state.location === location.name}
        label={location.name}
      />
    );
  };

  requestRide = () => {
    // add submission check
    if (this.state.submitting) {
      this.props.alertWithType('info', 'Info', 'Your request is in progress.');
      return;
    }

    this.setState(() => {
      return { submitting: true };
    });

    if (this.state.location === '') {
      this.props.alertWithType('error', 'Error', 'Choose a pickup location.');
      return;
    }

    const shuffledRides = shuffle(this.props.event.rides);
    shuffledRides.some(ride => {
      if (
        ride.passengers === undefined ||
        ride.passengers.length < ride.passengerLimit
      ) {
        this.setState(() => {
          return {
            loading: true,
          };
        });
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
            location: this.state.location,
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
            this.setState(() => {
              return {
                loading: false,
              };
            });
            this.props.refresh(false);
            this.props.navigator.pop();
          })
          .catch(err => {
            this.setState(() => {
              return {
                loading: false,
              };
            });
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
          <When condition={this.state.loading}>
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
              dataSource={this.ds.cloneWithRows(this.state.pickupLocations)}
              renderRow={location => this.renderOption(location)}
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
