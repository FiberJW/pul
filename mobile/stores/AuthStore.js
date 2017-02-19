import { observable, action } from 'mobx';
import { AsyncStorage } from 'react-native';
import Exponent, { Notifications } from 'exponent';
import _ from 'lodash';

export class AuthStore {
  authStates = ['unauthenticated', 'authenticated', 'attempting']
  @observable.deep userData = null;
  @observable state = this.authStates[0];
  @observable verified = false;
  @observable error = null;
  @observable userId = null;

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
        this.userData = { uid: user.uid, ...userData };
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

  @action login = async (credentials = {}) => {
    this.state = this.authStates[2];

    try {
      const user = await global.firebaseApp.auth().signInWithEmailAndPassword(
        credentials.email,
        credentials.password,
      );

      if (!user.emailVerified) {
        user.sendEmailVerification();
      }

      const token = await Notifications.getExponentPushTokenAsync();

      await global.firebaseApp.database().ref('users').child(user.uid).update({
        pushToken: token,
        deviceId: Exponent.Constants.deviceId,
        settings: {
          notifications: false,
        },
      });

      const userSnap = await global.firebaseApp.database().ref('users').child(user.uid).once('value');

      if (!userSnap.val().deviceId) {
        await global.firebaseApp.database().ref('users').child(user.uid).update({
          deviceId: Exponent.Constants.deviceId,
        });
      } else if (userSnap.val().deviceId !== Exponent.Constants.deviceId) {
        // if this is not the same device as last time, sign out
        await global.firebaseApp.auth().signOut();
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

      this.userId = user.uid;
      this.state = this.authStates[1];
    } catch (err) {
      this.state = this.authStates[0];
      throw err; // throw error again catch in promise callback
    }
  }

  @action logout = async () => {
    await global.firebaseApp.database()
    .ref('users')
    .child(this.userId)
    .update({
      pushToken: null,
    });

    this.unWatchUserData();
    this.state = this.authStates[0];
    global.firebaseApp.auth().signOut();
  }

  @action sendPasswordResetEmail = () => {
    global.firebaseApp.auth().sendPasswordResetEmail(this.userData.email);
  }

  @action update = () => {}

  @action watchUserData = () => {
    global.firebaseApp.database()
    .ref('users')
    .child(this.userId)
    .on('value', this.mergeUserData);
  }

  @action unWatchUserData = () => {
    global.firebaseApp.database()
    .ref('users')
    .child(this.userId)
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
