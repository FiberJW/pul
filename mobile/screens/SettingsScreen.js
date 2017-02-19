import React, { Component, PropTypes } from 'react';
import {
  View,
  ScrollView,
  Text,
  Alert,
  AsyncStorage,
  StyleSheet,
  Switch,
  Platform,
  TouchableOpacity,
} from 'react-native';
import colors from '../config/colors';
import { Permissions } from 'exponent';
import { NavigationStyles } from '@exponent/ex-navigation';
import Router from '../navigation/Router';
import Prompt from 'react-native-prompt';
import { observer, inject } from 'mobx-react/native';
import connectDropdownAlert from '../utils/connectDropdownAlert';

/**
 *  Allows the user to have some control over account data and app settings
 */
@connectDropdownAlert
@observer(['eventStore', 'trexStore'])
export default class SettingsScreen extends Component {
  static route = {
    styles: {
      ...NavigationStyles.Fade,
    },
  }
  static propTypes = {
    navigator: PropTypes.object,
    navigation: PropTypes.object,
    alertWithType: PropTypes.func.isRequired,
    eventStore: PropTypes.object,
    trexStore: PropTypes.object,
  }

  state = {
    namePromptVisible: false,
    phoneNumberPromptVisible: false,
    user: {},
    notifications: true,
    feedbackPromptVisible: false,
  }

  componentWillMount() {
    this.getUser();
  }

  /**
   *  getUser grabs user data from firebase
   */
  getUser = () => {
    global.firebaseApp.database()
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
  }

  render() {
    return (
      <ScrollView contentContainerStyle={ styles.container }>
        <View>
          <View style={ styles.sectionHeaderContainer }>
            <Text style={ styles.sectionHeaderText }>ACCOUNT</Text>
            <View style={ styles.sectionHeaderUnderline } />
          </View>
          <TouchableOpacity
            onPress={
              () => this.setState(() => {
                return { namePromptVisible: true };
              })
            }
            style={ styles.fieldContainer }
          >
            <Text style={ styles.fieldLabel }>Name</Text>
            <Text style={ styles.fieldContents }>{this.state.user.displayName}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={
              () => this.setState(() => {
                return { phoneNumberPromptVisible: true };
              })
            }
            style={ styles.fieldContainer }
          >
            <Text style={ styles.fieldLabel }>Phone number</Text>
            <Text style={ styles.fieldContents }>{this.state.user.phoneNumber}</Text>
          </TouchableOpacity>
          <View style={ styles.switchFieldContainer }>
            <Text style={ styles.switchFieldLabel }>Push notifications</Text>
            <Switch
              onValueChange={ (value) => {
                Permissions.askAsync(Permissions.REMOTE_NOTIFICATIONS).then(({ status }) => {
                  if (status === 'granted') {
                    this.setState(() => {
                      return {
                        notifications: value,
                      };
                    });
                    global.firebaseApp.database()
                    .ref('users')
                    .child(global.firebaseApp.auth().currentUser.uid)
                    .update({
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
                  } else {
                    this.setState(() => {
                      return {
                        notifications: !value,
                      };
                    });
                    this.props.alertWithType('error', 'Error', 'To stay in the loop, you need to enable push notifications.');
                  }
                }).catch(() => {
                  this.setState(() => {
                    return {
                      notifications: !value,
                    };
                  });
                });
              } }
              value={ this.state.notifications }
            />
          </View>
        </View>
        <View>
          <TouchableOpacity
            onPress={
              () => {
                if (global.firebaseApp.auth().currentUser.emailVerified) {
                  this.setState(() => {
                    return { feedbackPromptVisible: true };
                  });
                } else {
                  this.props.alertWithType('error', 'Error', 'You must verify your email before continuing.');
                }
              }
            }
            style={ styles.fieldContainer }
          >
            <Text style={ styles.fieldLabel }>Send feedback</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={ () => {
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
                      global.firebaseApp.database()
                      .ref('users')
                      .child(global.firebaseApp.auth().currentUser.uid)
                      .update({
                        pushToken: null,
                      })
                      .then(() => {
                        this.props.navigation.getNavigator('master').immediatelyResetStack([Router.getRoute('onboarding')], 0);
                        this.props.eventStore.reset();
                        this.props.trexStore.reset();
                        AsyncStorage.clear();
                        global.firebaseApp.auth().signOut();
                      })
                      .catch(error => {
                        this.props.alertWithType('error', 'Error', error.toString());
                      });
                    },
                  },
                ],
              );
            } }
            style={ styles.fieldContainer }
          >
            <Text style={ styles.fieldLabel }>Log out</Text>
          </TouchableOpacity>
          <Prompt
            title="Change Display Name"
            placeholder="Start typing"
            defaultValue={ this.state.user.displayName }
            visible={ this.state.namePromptVisible }
            onCancel={ () => this.setState(() => {
              return { namePromptVisible: false };
            }) }
            onSubmit={ (displayName) => {
              if (displayName.trim().length < 4) {
                this.props.alertWithType('error', 'Error', 'Please enter your full name.');
                this.setState(() => {
                  return { phoneNumberPromptVisible: false };
                });
                return;
              }
              global.firebaseApp.auth().currentUser.updateProfile({
                displayName: displayName.trim(),
              }).then(() => {
                global.firebaseApp.database()
                .ref('users')
                .child(global.firebaseApp.auth().currentUser.uid)
                .update({
                  displayName: displayName.trim(),
                })
                .then(() => {
                  this.getUser();
                  this.setState(() => {
                    return { namePromptVisible: false };
                  });
                });
              })
              .catch(error => {
                this.setState(() => {
                  return { namePromptVisible: false };
                });
                this.props.alertWithType('error', 'Error', error.toString());
              });
            } }
          />
          <Prompt
            title="Change Phone Number"
            placeholder="Start typing"
            defaultValue={ this.state.user.phoneNumber }
            visible={ this.state.phoneNumberPromptVisible }
            onCancel={ () => this.setState(() => {
              return { phoneNumberPromptVisible: false };
            }) }
            onSubmit={ (phoneNumber) => {
              if (phoneNumber.trim().length !== 10) {
                this.props.alertWithType('error', 'Error', 'Please enter your 10-digit phone number.');
                this.setState(() => {
                  return { phoneNumberPromptVisible: false };
                });
                return;
              }
              global.firebaseApp.database()
              .ref('users')
              .child(global.firebaseApp.auth().currentUser.uid)
              .update({
                phoneNumber: phoneNumber.trim(),
              })
              .then(() => {
                this.getUser();
                this.setState(() => {
                  return { phoneNumberPromptVisible: false };
                });
              })
              .catch(error => {
                this.setState(() => {
                  return { phoneNumberPromptVisible: false };
                });
                this.props.alertWithType('error', 'Error', error.toString());
              });
            } }
          />
          <Prompt
            title="What's Up?"
            placeholder="Start typing"
            visible={ this.state.feedbackPromptVisible }
            onCancel={ () => this.setState(() => {
              return { feedbackPromptVisible: false };
            }) }
            onSubmit={ (feedback) => {
              global.firebaseApp.database()
              .ref('feedback')
              .push({
                userUID: global.firebaseApp.auth().currentUser.uid,
                message: feedback.trim(),
              })
              .then(() => {
                this.getUser();
                this.setState(() => {
                  return { feedbackPromptVisible: false };
                });
                this.props.alertWithType('success', '😎', 'Thanks for your feedback!');
              })
              .catch(error => {
                this.setState(() => {
                  return { feedbackPromptVisible: false };
                });
                this.props.alertWithType('error', 'Error', error.toString());
              });
            } }
          />
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
