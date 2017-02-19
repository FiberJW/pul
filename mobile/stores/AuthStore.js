import { observable, action } from 'mobx';
import { AsyncStorage, Alert } from 'react-native';
import Exponent, { Notifications } from 'exponent';
import _ from 'lodash';

export class AuthStore {
  authStates = ['unauthenticated', 'authenticated', 'attempting']
  @observable.deep userData = null;
  @observable state = this.authStates[0];
  @observable verified = false;
  @observable error = null;

  @action signup = (credentials = {}, success = () => {}, error = () => {}) => {
    this.state = this.authStates[2];

    global.firebaseApp.auth().createUserWithEmailAndPassword(
      credentials.email,
      credentials.password,
    ).then(user => {
      user.updateProfile({ displayName: credentials.name })
      .then(() => {
        user.sendEmailVerification();
      });
      Notifications.getExponentPushTokenAsync().then((token) => {
        const userData = {
          uid: user.uid,
          phoneNumber: credentials.phoneNumber,
          school: credentials.school.uid,
          ridesGiven: 0,
          ridesReceived: 0,
          pushToken: token,
          deviceId: Exponent.Constants.deviceId,
          settings: {
            notifications: true,
          },
          displayName: credentials.name,
          email: credentials.email,
        };

        global.firebaseApp.database().ref('users').child(user.uid).set(userData);
        this.userData = userData;
      });
      try {
        AsyncStorage.setItem('@PUL:user', JSON.stringify(credentials));
      } catch (err) {
        this.setError(err);
      }
      const emailWatch = setInterval(() => {
        if (global.firebaseApp.auth().currentUser) {
          if (global.firebaseApp.auth().currentUser.emailVerified) {
            clearInterval(emailWatch);
          }
          global.firebaseApp.auth().currentUser.reload();
        }
      }, 1000);
      this.state = this.authStates[1];
      this.watchUserData();
      success();
    }).catch(err => {
      this.state = this.authStates[0];
      this.setError(err);
      error();
    });
  }

  @action login = async (credentials = {}, success = () => {}, error = () => {}) => {
    this.state = this.authStates[2];

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
            this.state = this.authStates[0];
            return;
          }

          const emailWatch = setInterval(() => {
            if (global.firebaseApp.auth().currentUser) {
              if (global.firebaseApp.auth().currentUser.emailVerified) {
                clearInterval(emailWatch);
              }
              global.firebaseApp.auth().currentUser.reload();
            }
          }, 1000);
          this.state = this.authStates[1];
          success();
        });
      }).catch(err => {
        switch (err.code) {
          case 'auth/network-request-failed':
            Alert.alert(null, 'No Internet connection. Please press \'OK\' when connected.', [
              { text: 'OK', onPress: this.login },
            ]);
            break;
          case 'auth/user-not-found':
          case 'auth/invalid-email':
          case 'auth/user-disabled':
          case 'auth/wrong-password':
            this.state = this.authStates[0];
            break;
          default:
            this.setError(`Something is on fire: ${err.code}`);
            this.state = this.authStates[0];
            error(err);
        }
      });
    } else {
      this.state = this.authStates[0];
    }
  }

  @action logout = (success = () => {}, error = () => {}) => {
    global.firebaseApp.database()
    .ref('users')
    .child(global.firebaseApp.auth().currentUser.uid)
    .update({
      pushToken: null,
    })
    .then(() => {
      this.state = this.authStates[0];
      AsyncStorage.clear();
      this.unWatchUserData();
      global.firebaseApp.auth().signOut();
      success();
    })
    .catch(err => {
      this.setError(err);
      error(err);
    });
  }

  @action sendPasswordResetEmail = () => {
    global.firebaseApp.auth().sendPasswordResetEmail(this.userData.email);
  }

  @action update = () => {}

  @action watchUserData = () => {
    global.firebaseApp.database()
    .ref('users')
    .child(this.userData.uid)
    .on('value', this.mergeUserData);
  }

  @action unWatchUserData = () => {
    global.firebaseApp.database()
    .ref('users')
    .child(this.userData.uid)
    .off('value', this.mergeUserData);
  }

  @action sendEmailVerification = () => {
    global.firebaseApp.auth().currentUser.sendEmailVerification();
  }

  @action mergeUserData = (userSnap) => {
    const newUserData = userSnap.val();
    _.merge(this.userData, newUserData);
  }

  @action setError = (error = new Error(''), timeInSeconds = 1) => {
    this.error = error;
    setTimeout(() => {
      this.error = null;
    }, timeInSeconds * 1000);
  }
}

export default new AuthStore();
