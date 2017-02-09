import Exponent, { Font, Components } from 'exponent';
import React, { Component } from 'react';
import {
  AsyncStorage,
  Alert,
} from 'react-native';
import {
  NavigationProvider,
  StackNavigation,
} from '@exponent/ex-navigation';
import Router from './navigation/Router';
import * as firebase from 'firebase';
import { firebaseConfig, sentryURL } from './config/keys';
import { ActionSheetProvider } from '@exponent/react-native-action-sheet';
import DropdownAlertProvider from './components/DropdownAlertProvider';

const Raven = require('raven-js');
require('raven-js/plugins/react-native')(Raven);

if (!__DEV__) { // eslint-disable-line jsx-control-statements/jsx-jcs-no-undef
  // enables sentry only in production
  Raven
  .config(sentryURL, { release: require('./exp.json').version })
  .install();

  // this guards against console usage in production builds since
  // babel transform of remove console won't work with react-native preset
  ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception',
    'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'profile', 'profileEnd',
    'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'].forEach(
    (methodName) => {
      console[methodName] = () => { /* noop */ };
    });
}

class App extends Component {
  state = {
    loading: true,
    loggedIn: false,
  }

  componentDidMount() {
    this.setup().catch(e => {
      Alert.alert(e.toString());
      this.setState(() => {
        return { loading: false, loggedIn: false };
      });
    });
  }

  /**
   *  Asks for permissions, loads fonts, and starts Firebase
   */
  async setup() {
    const { Permissions } = Exponent;
    await Permissions.askAsync(Permissions.LOCATION);
    await Permissions.askAsync(Permissions.REMOTE_NOTIFICATIONS);

    await Font.loadAsync({
      'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf'),
      'open-sans-light': require('./assets/fonts/OpenSans-Light.ttf'),
      'open-sans-extrabold': require('./assets/fonts/OpenSans-ExtraBold.ttf'),
      'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
      'open-sans-semibold': require('./assets/fonts/OpenSans-Semibold.ttf'),
      'neutra-bold': require('./assets/fonts/NeutraTextBold.ttf'),
    });
    await this.startFirebase();
  }

  startFirebase = async () => {
    try {
      global.firebaseApp = firebase.initializeApp(firebaseConfig);
    } catch (error) {
      Alert.alert(null, 'Something\'s on fire. Please press \'OK\' to try again.', [
        { text: 'OK', onPress: this.startFirebase },
      ]);
    }
    try {
      await this.signIn();
    } catch (e) {
      this.setState(() => {
        return { loading: false, loggedIn: false };
      });
    }
  }

  signIn = async () => {
    let userCredentials = await AsyncStorage.getItem('@PUL:user');
    if (userCredentials !== null) {
      userCredentials = JSON.parse(userCredentials);
      global.firebaseApp.auth().signInWithEmailAndPassword(
        userCredentials.email,
        userCredentials.password,
      ).then((user) => {
        global.firebaseApp.database()
        .ref('users')
        .child(user.uid)
        .once('value')
        .then(userSnap => {
          // if userSnap.val().deviceId === undefined then give it one and continue sign in
          if (!userSnap.val().deviceId) {
            global.firebaseApp.database().ref('users').child(user.uid).update({
              deviceId: Exponent.Constants.deviceId,
            });
          } else if (userSnap.val().deviceId !== Exponent.Constants.deviceId) {
          // if this is not the same device as last time, sign out
            global.firebaseApp.auth().signOut();
            this.setState(() => {
              return { loading: false, loggedIn: false };
            });
            return;
          }

          const emailWatch = setInterval(() => {
            if (global.firebaseApp.auth().currentUser.emailVerified) {
              clearInterval(emailWatch);
            }
            global.firebaseApp.auth().currentUser.reload();
          }, 1000);
          this.setState(() => {
            return { loading: false, loggedIn: true };
          });
        });
      }).catch(error => {
        switch (error.code) {
          case 'auth/network-request-failed':
            Alert.alert(null, 'No Internet connection. Please press \'OK\' when connected.', [
              { text: 'OK', onPress: this.signIn },
            ]);
            break;
          case 'auth/user-not-found':
          case 'auth/invalid-email':
          case 'auth/user-disabled':
          case 'auth/wrong-password':
            this.setState(() => {
              return { loading: false, loggedIn: false };
            });
            break;
          default:
            Alert.alert(null, 'Something is on fire.', [
              { text: 'OK' },
            ]);
            this.setState(() => {
              return { loading: false, loggedIn: false };
            });
        }
      });
    } else {
      this.setState(() => {
        return { loading: false };
      });
    }
  };

  render() {
    const route = this.state.loggedIn ? 'tabs' : 'onboarding';

    return (
      <Choose>
        <When condition={ this.state.loading }>
          <Components.AppLoading />
        </When>
        <Otherwise>
          <DropdownAlertProvider>
            <ActionSheetProvider>
              <NavigationProvider router={ Router }>
                <StackNavigation id="master" initialRoute={ Router.getRoute(route) } />
              </NavigationProvider>
            </ActionSheetProvider>
          </DropdownAlertProvider>
        </Otherwise>
      </Choose>
    );
  }
}

Exponent.registerRootComponent(App);
