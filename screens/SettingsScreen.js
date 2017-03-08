import React, { Component, PropTypes } from 'react';
import {
  View,
  ScrollView,
  Text,
  Alert,
  AsyncStorage,
  StyleSheet,
  Switch,
  TextInput,
  Platform,
  TouchableOpacity,
} from 'react-native';
import colors from '../config/colors';
import { Notifications, Permissions } from 'expo';
import { NavigationStyles } from '@expo/ex-navigation';
import Router from '../navigation/Router';
import { observer, inject } from 'mobx-react/native';
import connectDropdownAlert from '../utils/connectDropdownAlert';
import { email } from 'react-native-communications';

/**
 *  Allows the user to have some control over account data and app settings
 */
@connectDropdownAlert
@inject('authStore', 'eventStore', 'trexStore')
@observer
export default class SettingsScreen extends Component {
  static route = {
    styles: {
      ...NavigationStyles.Fade,
    },
  };
  static propTypes = {
    navigator: PropTypes.object,
    navigation: PropTypes.object,
    alertWithType: PropTypes.func.isRequired,
    eventStore: PropTypes.object,
    trexStore: PropTypes.object,
    authStore: PropTypes.object,
  };

  state = {
    user: {},
    notifications: false,
  };

  componentWillMount() {
    this.getUser();
  }

  /**
   *  getUser grabs user data from firebase
   */
  getUser = () => {
    global.firebaseApp
      .database()
      .ref('users')
      .child(global.firebaseApp.auth().currentUser.uid)
      .once('value')
      .then(userSnap => {
        this.setState(() => {
          return {
            user: userSnap.val(),
            notifications: userSnap.val().settings.notifications,
          };
        });
      })
      .catch(err => {
        this.props.alertWithType('error', 'Error', err.toString());
      });
  };

  togglePushNotifications = value => {
    Permissions.askAsync(Permissions.REMOTE_NOTIFICATIONS)
      .then(({ status }) => {
        if (status === 'granted') {
          Notifications.getExponentPushTokenAsync().then(token => {
            this.setState(() => {
              return {
                notifications: value,
              };
            });
            global.firebaseApp
              .database()
              .ref('users')
              .child(global.firebaseApp.auth().currentUser.uid)
              .update({
                pushToken: token,
                settings: {
                  notifications: value,
                },
              })
              .then(() => {
                this.getUser();
              })
              .catch(error => {
                this.setState(() => {
                  return {
                    notifications: !value,
                  };
                });
                this.props.alertWithType('error', 'Error', error.toString());
              });
          });
        } else {
          this.setState(() => {
            return {
              notifications: !value,
            };
          });
          this.props.alertWithType(
            'error',
            'Error',
            'To stay in the loop, you need to enable push notifications.',
          );
        }
      })
      .catch(() => {
        this.setState(() => {
          return {
            notifications: !value,
          };
        });
      });
  };

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeaderText}>ACCOUNT</Text>
            <View style={styles.sectionHeaderUnderline} />
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              editable
              autoCorrect={false}
              underlineColorAndroid="transparent"
              onChangeText={displayName => {
                this.setState(prevState => ({
                  user: {
                    ...prevState.user,
                    displayName,
                  },
                }));
                if (displayName.trim().length < 4) {
                  this.props.alertWithType(
                    'error',
                    'Error',
                    'Please enter your full name.',
                  );
                  return;
                }
                global.firebaseApp
                  .auth()
                  .currentUser.updateProfile({
                    displayName: displayName.trim(),
                  })
                  .then(() => {
                    global.firebaseApp
                      .database()
                      .ref('users')
                      .child(global.firebaseApp.auth().currentUser.uid)
                      .update({
                        displayName: displayName.trim(),
                      });
                  })
                  .catch(error => {
                    this.props.alertWithType(
                      'error',
                      'Error',
                      error.toString(),
                    );
                  });
              }}
              style={styles.fieldContents}
              onEndEditing={this.getUser}
              value={this.state.user.displayName}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Phone number</Text>
            <TextInput
              autoCorrect={false}
              style={styles.fieldContents}
              onEndEditing={this.getUser}
              underlineColorAndroid="transparent"
              onChangeText={phoneNumber => {
                this.setState(prevState => ({
                  user: {
                    ...prevState.user,
                    phoneNumber,
                  },
                }));
                if (phoneNumber.trim().length !== 10) {
                  this.props.alertWithType(
                    'error',
                    'Error',
                    'Please enter your 10-digit phone number.',
                  );
                  return;
                }
                global.firebaseApp
                  .database()
                  .ref('users')
                  .child(global.firebaseApp.auth().currentUser.uid)
                  .update({
                    phoneNumber: phoneNumber.trim(),
                  })
                  .catch(error => {
                    this.props.alertWithType(
                      'error',
                      'Error',
                      error.toString(),
                    );
                  });
              }}
              value={this.state.user.phoneNumber}
            />
          </View>
          <View style={styles.switchFieldContainer}>
            <TouchableOpacity
              onPress={() =>
                this.togglePushNotifications(!this.state.notifications)}>
              <Text style={styles.switchFieldLabel}>Push notifications</Text>
            </TouchableOpacity>
            <Switch
              onValueChange={this.togglePushNotifications}
              value={this.state.notifications}
            />
          </View>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              email(
                ['datwheat@gmail.com'],
                null,
                null,
                `PÜL Feedback <${this.props.authStore.userId}>`,
                null,
              );
            }}
            style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Send feedback</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                Platform.OS === 'ios' ? 'Log Out' : 'Log out',
                'Are you sure? Logging out will remove all PÜL data from this device.',
                [
                  {
                    text: 'Cancel',
                    onPress: () => {},
                    style: 'cancel',
                  },
                  {
                    text: 'OK',
                    onPress: () => {
                      this.props.authStore
                        .logout()
                        .then(() => {
                          this.props.navigation
                            .getNavigator('master')
                            .immediatelyResetStack(
                              [Router.getRoute('onboarding')],
                              0,
                            );
                          this.props.eventStore.reset();
                          this.props.trexStore.reset();
                          AsyncStorage.clear();
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
            }}
            style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.eggshell,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  sectionHeaderContainer: {
    paddingBottom: 16,
  },
  sectionHeaderText: {
    fontFamily: 'open-sans-bold',
    fontSize: 16,
    color: colors.blue,
  },
  sectionHeaderUnderline: {
    marginTop: 8,
    height: 2,
    borderRadius: 4,
    backgroundColor: colors.blue,
  },
  fieldContainer: {
    paddingBottom: 16,
  },
  fieldLabel: {
    marginBottom: 8,
    fontFamily: 'open-sans-semibold',
    fontSize: 20,
    color: colors.black,
  },
  fieldContents: {
    fontFamily: 'open-sans',
    height: 24,
    fontSize: 14,
    color: colors.grey,
  },
  switchFieldContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchFieldLabel: {
    fontFamily: 'open-sans-semibold',
    fontSize: 20,
    color: colors.black,
  },
});
