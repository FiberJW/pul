import React, { Component, PropTypes } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
  Vibration,
  Platform,
  Alert,
} from 'react-native';
import Router from '../navigation/Router';
import { withNavigation } from '@exponent/ex-navigation';
import colors from '../config/colors';
import Collapsible from 'react-native-collapsible';
import moment from 'moment';
import ElevatedView from 'react-native-elevated-view';
import createLyftDeepLink from '../utils/createLyftDeepLink';
import filter from '../utils/filter';
import { maybeOpenURL } from 'react-native-app-link';
import connectDropdownAlert from '../utils/connectDropdownAlert';

@withNavigation
@connectDropdownAlert
export default class Event extends Component {
  static propTypes = {
    event: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    navigation: PropTypes.object.isRequired,
    refresh: PropTypes.func,
    alertWithType: PropTypes.func.isRequired,
  };

  state = {
    isCollapsed: true,
    isRider: false,
    isDriver: false,
  };

  componentWillMount() {
    !!this.props.event.rides &&
      this.props.event.rides.forEach(ride => {
        if (ride.driver === global.firebaseApp.auth().currentUser.uid) {
          this.setState(() => {
            return {
              isDriver: true,
            };
          });
        }
        !!ride.passengers &&
          ride.passengers.some(passenger => {
            if (
              passenger.userUID === global.firebaseApp.auth().currentUser.uid
            ) {
              this.setState(() => {
                return {
                  isRider: true,
                };
              });
              return true;
            }
            return false;
          });
      });
  }

  render() {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => {
          if (
            this.props.event.createdBy ===
            global.firebaseApp.auth().currentUser.uid
          ) {
            Vibration.vibrate([0, 25]);
            Alert.alert(
              Platform.OS === 'ios' ? 'Delete Event' : 'Delete event',
              'Are you sure that you want to delete this event?',
              [
                {
                  text: 'Cancel',
                  onPress: () => {},
                  style: 'cancel',
                },
                {
                  text: 'OK',
                  onPress: () => {
                    global.firebaseApp
                      .database()
                      .ref('users')
                      .child(global.firebaseApp.auth().currentUser.uid)
                      .once('value')
                      .then(userSnap => {
                        const school = userSnap.val().school;
                        global.firebaseApp
                          .database()
                          .ref('schools')
                          .child(school)
                          .child('events')
                          .child(this.props.event.uid)
                          .remove();
                      })
                      .catch(error => {
                        this.props.alertWithType(
                          'error',
                          'Error',
                          error.toString(),
                        );
                      });
                  },
                },
              ],
            );
          }
        }}
        onPress={() => this.setState(prevState => {
          return {
            isCollapsed: !prevState.isCollapsed,
          };
        })}>
        <ElevatedView style={styles.cardContainer} elevation={2}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>
              {filter.clean(this.props.event.name.toUpperCase())}
            </Text>
            <Text style={styles.type}>
              {this.props.event.type.toUpperCase()}
            </Text>
          </View>
          <Text
            onPress={() => this.setState(prevState => {
              return {
                isCollapsed: !prevState.isCollapsed,
              };
            })}
            onLongPress={() => {
              this.props.navigation
                .getNavigator('master')
                .push(Router.getRoute('location', { event: this.props.event }));
            }}
            style={styles.location}>
            {this.props.event.location.address}
          </Text>
          <Text style={styles.time}>
            {moment(this.props.event.date)
              .add(this.props.event.time.hours, 'hours')
              .add(this.props.event.time.minutes, 'minutes')
              .format('LLLL')}
          </Text>
          <Collapsible duration={200} collapsed={this.state.isCollapsed}>
            <If condition={this.props.event.description}>
              <Text style={styles.description}>
                {filter.clean(this.props.event.description)}
              </Text>
            </If>
            <If condition={this.props.event.url}>
              <Text
                style={styles.website}
                onPress={() => this.setState(prevState => {
                  return {
                    isCollapsed: !prevState.isCollapsed,
                  };
                })}
                onLongPress={() => {
                  let url;
                  if (
                    this.props.event.url.includes('http') ||
                    this.props.event.url.includes('https')
                  ) {
                    url = this.props.event.url;
                  } else {
                    url = `http://${this.props.event.url}`;
                  }
                  Linking.canOpenURL(url)
                    .then(supported => {
                      if (!supported) {
                        return false;
                      }
                      return Linking.openURL(url);
                    })
                    .catch(err => {
                      this.props.alertWithType(
                        'error',
                        'Error',
                        err.toString(),
                      );
                    });
                }}>
                {filter.clean(this.props.event.url)}
              </Text>
            </If>
            <View style={styles.buttons}>
              <TouchableOpacity
                disabled={
                  !this.props.event.availableRides ||
                    this.state.isRider ||
                    this.state.isDriver
                }
                onPress={() => {
                  if (global.firebaseApp.auth().currentUser.emailVerified) {
                    this.props.navigation.getNavigator('master').push(
                      Router.getRoute('setPickupLocation', {
                        refresh: this.props.refresh,
                        event: this.props.event,
                      }),
                    );
                  } else {
                    this.props.alertWithType(
                      'error',
                      'Error',
                      'You must verify your email before continuing. No creepers allowed!',
                    );
                  }
                }}
                style={[
                  styles.rideButton,
                  {
                    backgroundColor: !this.props.event.availableRides ||
                      this.state.isRider ||
                      this.state.isDriver
                      ? colors.disabledBlue
                      : colors.blue,
                  },
                ]}>
                <Text style={styles.rideButtonText}>
                  RIDE
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={this.state.isRider || this.state.isDriver}
                onPress={() => {
                  if (global.firebaseApp.auth().currentUser.emailVerified) {
                    this.props.navigation.getNavigator('master').push(
                      Router.getRoute('setDriveOptions', {
                        refresh: this.props.refresh,
                        event: this.props.event,
                      }),
                    );
                  } else {
                    this.props.alertWithType(
                      'error',
                      'Error',
                      'You must verify your email before continuing. No creepers allowed!',
                    );
                  }
                }}
                style={[
                  styles.driveButton,
                  {
                    backgroundColor: this.state.isRider || this.state.isDriver
                      ? colors.disabledPurp
                      : colors.purp,
                  },
                ]}>
                <Text style={styles.driveButtonText}>
                  DRIVE
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.driversAvailable}>
              {!!this.state.isRider && "You're receiving a ride."}
              {!!this.state.isDriver && "You're giving a ride."}
              {!!(!this.state.isRider &&
                !this.state.isDriver &&
                this.props.event.availableRides > 0) &&
                `${this.props.event.availableRides} driver${this.props.event.availableRides > 1 ? 's' : ''} available`.toUpperCase()}
              {!!(!this.state.isRider &&
                !this.state.isDriver &&
                !this.props.event.availableRides) &&
                'No drivers available'.toUpperCase()}
            </Text>

            {!!(!this.state.isDriver && !this.state.isRider) &&
              <TouchableOpacity
                onPress={() => {
                  createLyftDeepLink(this.props.event)
                    .then(url => {
                      maybeOpenURL(url, {
                        appName: 'Lyft',
                        appStoreId: 'id529379082',
                        playStoreId: 'me.lyft.android',
                      }).catch(err => {
                        this.props.alertWithType(
                          'error',
                          'Error',
                          err.toString(),
                        );
                      });
                    })
                    .catch(err => {
                      this.props.alertWithType(
                        'error',
                        'Error',
                        err.toString(),
                      );
                    });
                }}
                style={styles.lyftButton}>
                <Image
                  resizeMode="contain"
                  style={styles.lyftIcon}
                  source={require('pul/assets/images/lyft_logo_white.png')}
                />
                <Text style={styles.lyftButtonText}>
                  RIDE WITH LYFT
                </Text>
                <View />
              </TouchableOpacity>}
          </Collapsible>
        </ElevatedView>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    // borderRadius: 4,
    marginVertical: 4,
    marginHorizontal: 8,
    backgroundColor: 'white',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: 'open-sans-bold',
    fontSize: 16,
    color: colors.black,
    width: Dimensions.get('window').width / 2,
  },
  type: {
    alignSelf: 'flex-start',
    fontFamily: 'open-sans-bold',
    fontSize: 12,
  },
  location: {
    paddingTop: 8,
    fontFamily: 'open-sans-semibold',
    fontSize: 12,
    color: colors.blue,
  },
  time: {
    fontFamily: 'open-sans-semibold',
    fontSize: 12,
    color: colors.black,
    paddingBottom: 4,
  },
  description: {
    paddingTop: 4,
    fontFamily: 'open-sans',
    fontSize: 14,
    color: colors.black,
  },
  website: {
    paddingTop: 8,
    fontFamily: 'open-sans-light',
    fontSize: 12,
    color: colors.blue,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rideButton: {
    borderRadius: 4,
    alignItems: 'center',
    height: 40,
    backgroundColor: colors.blue,
    flex: 1,
    marginRight: 16,
    justifyContent: 'center',
  },
  rideButtonText: {
    fontSize: 18,
    fontFamily: 'open-sans-bold',
    color: 'white',
  },
  driversAvailable: {
    color: colors.black,
    fontSize: 12,
    alignSelf: 'center',
    fontFamily: 'open-sans',
    textAlign: 'center',
  },
  driveButton: {
    borderRadius: 4,
    flex: 1,
    marginLeft: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    height: 40,
    backgroundColor: colors.purp,
  },
  driveButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'open-sans-bold',
  },
  lyftButton: {
    borderRadius: 4,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    marginVertical: 8,
    backgroundColor: '#FF06B8',
  },
  lyftButtonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: -30,
    fontFamily: 'open-sans-bold',
  },
  lyftIcon: {
    height: 21,
    width: 30,
  },
});
