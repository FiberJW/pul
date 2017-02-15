import { observable, action } from 'mobx';
import { AsyncStorage } from 'react-native';
import Exponent, { Notifications } from 'exponent';
import _ from 'lodash';

class AuthStore {
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
        if (global.firebaseApp.auth().currentUser.emailVerified) {
          this.verified = true;
          clearInterval(emailWatch);
        }
        global.firebaseApp.auth().currentUser.reload();
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

  @action login = (credentials = {}, success = () => {}, error = () => {}) => {
    global.firebaseApp.auth().signInWithEmailAndPassword(
      credentials.email,
      credentials.password,
    ).then(user => {
      if (!user.emailVerified) {
        user.sendEmailVerification();
      }
      Notifications.getExponentPushTokenAsync().then((token) => {
        global.firebaseApp.database().ref('users').child(user.uid).update({
          pushToken: token,
          deviceId: Exponent.Constants.deviceId,
        });
      });
      try {
        AsyncStorage.setItem('@PUL:user', JSON.stringify(credentials));
      } catch (err) {
        this.setError(err);
      }
      const emailWatch = setInterval(() => {
        if (global.firebaseApp.auth().currentUser.emailVerified) {
          clearInterval(emailWatch);
        }
        global.firebaseApp.auth().currentUser.reload();
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

  @action logout = (success = () => {}, error = () => {}) => {
    global.firebaseApp.database()
    .ref('users')
    .child(global.firebaseApp.auth().currentUser.uid)
    .update({
      pushToken: null,
    })
    .then(() => {
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
