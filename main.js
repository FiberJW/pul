import Expo, { Font, Permissions, AppLoading } from 'expo';
import React, { Component, PropTypes } from 'react';
import { AsyncStorage, Alert, View } from 'react-native';
import { NavigationProvider, StackNavigation } from '@expo/ex-navigation';
import Router from './navigation/Router';
import * as firebase from 'firebase';
import { firebaseConfig, sentryURL } from './config/keys';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import DropdownAlertProvider from './components/DropdownAlertProvider';
import ExpoSentryClient from '@expo/sentry-utils';
import connectDropdownAlert from './utils/connectDropdownAlert';
import { inject, observer, Provider as MobXProvider } from 'mobx-react/native';
import { observable } from 'mobx';
import authStore from './stores/AuthStore';
import eventStore from './stores/EventStore';
import trexStore from './stores/TrexStore';
import uiStore from './stores/UIStore';

if (!global.__DEV__) {
  // this guards against console usage in production builds since
  // babel transform of remove console won't work with react-native preset
  [
    'assert',
    'clear',
    'count',
    'debug',
    'dir',
    'dirxml',
    'error',
    'exception',
    'group',
    'groupCollapsed',
    'groupEnd',
    'info',
    'log',
    'profile',
    'profileEnd',
    'table',
    'time',
    'timeEnd',
    'timeStamp',
    'trace',
    'warn',
  ].forEach(methodName => {
    console[methodName] = () => {
      /* noop */
    };
  });

  ExpoSentryClient.setupSentry(
    sentryURL,
    require('./exp.json').version,
    require('./package.json').main
  );
}

@connectDropdownAlert
@inject('authStore')
@observer
class App extends Component {
  static propTypes = {
    authStore: PropTypes.object,
    alertWithType: PropTypes.func,
  };

  @observable loading = true;

  async setup() {
    await Permissions.askAsync(Permissions.LOCATION);
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
      Alert.alert(
        null,
        "Something's on fire. Please press 'OK' to try again.",
        [{ text: 'OK', onPress: this.startFirebase }]
      );
    }
    try {
      await this.signIn();
    } catch (error) {
      this.props.alertWithType('error', 'Error', error.toString());
      this.loading = false;
    }
  };

  signIn = async () => {
    let userCredentials = await AsyncStorage.getItem('@PUL:user');
    if (userCredentials !== null) {
      userCredentials = JSON.parse(userCredentials);
      try {
        await this.props.authStore.login(userCredentials, true);
        this.loading = false;
      } catch (error) {
        if (error.code) {
          switch (error.code) {
            case 'auth/network-request-failed':
              Alert.alert(
                null,
                "No Internet connection. Please press 'OK' when connected.",
                [{ text: 'OK', onPress: this.signIn }]
              );
              break;
            case 'auth/user-not-found':
            case 'auth/invalid-email':
            case 'auth/user-disabled':
            case 'auth/wrong-password':
              this.loading = false;
              break;
            default:
              Alert.alert(null, 'Something is on fire.', [{ text: 'OK' }]);
              this.loading = false;
          }
        } else {
          this.props.alertWithType('error', 'Error', error.toString());
          this.loading = false;
        }
      }
    } else {
      this.loading = false;
    }
  };

  componentDidMount() {
    this.setup().catch(e => {
      Alert.alert(e.toString());
      this.loading = false;
    });
  }

  render() {
    const route = this.props.authStore.state ===
      this.props.authStore.authStates[1]
      ? 'tabs'
      : 'onboarding';

    return (
      <Choose>
        <When condition={this.loading}>
          <AppLoading />
        </When>
        <Otherwise>
          <NavigationProvider router={Router}>
            <StackNavigation
              id="master"
              initialRoute={Router.getRoute(route)}
            />
          </NavigationProvider>
        </Otherwise>
      </Choose>
    );
  }
}

const Main = () => (
  <MobXProvider {...{ authStore, eventStore, trexStore, uiStore }}>
    <DropdownAlertProvider>
      <ActionSheetProvider>
        <App />
      </ActionSheetProvider>
    </DropdownAlertProvider>
  </MobXProvider>
);

Expo.registerRootComponent(Main);
