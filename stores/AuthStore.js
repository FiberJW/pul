import { observable, action } from "mobx";
import { AsyncStorage } from "react-native";
import Expo from "expo";
import _ from "lodash";
import { create, persist } from "mobx-persist";

export class AuthStore {
  authStates = ["unauthenticated", "authenticated", "attempting"];

  @persist("object")
  @observable
  userData = {};

  @persist
  @observable
  state = this.authStates[0];

  @persist
  @observable
  verified = false;

  @persist
  @observable
  error = null;

  @persist
  @observable
  userId = null;

  constructor() {
    this.hydrate();
  }

  @action hydrate = () => {
    const pour = create({
      storage: AsyncStorage
    });

    Object.keys(this).forEach(key => {
      pour(key, this);
    });
  };

  @action signup = async (credentials = {}) => {
    this.state = this.authStates[2];
    try {
      const user = await global.firebaseApp
        .auth()
        .createUserWithEmailAndPassword(
          credentials.email,
          credentials.password
        );

      await user.updateProfile({ displayName: credentials.name });
      await user.sendEmailVerification();

      const userData = {
        phoneNumber: credentials.phoneNumber,
        school: credentials.school.uid,
        ridesGiven: 0,
        ridesReceived: 0,
        pushToken: null,
        deviceId: Expo.Constants.deviceId,
        settings: {
          notifications: false
        },
        displayName: credentials.name,
        email: credentials.email
      };

      await global.firebaseApp
        .database()
        .ref("users")
        .child(user.uid)
        .set(userData);
      AsyncStorage.setItem("@PUL:user", JSON.stringify(credentials));

      this.watchEmailVerification();

      this.userId = user.uid;
      this.state = this.authStates[1];
      this.watchUserData();
    } catch (err) {
      this.state = this.authStates[0];
      throw err;
    }
  };

  @action login = async (credentials = {}, auto = false) => {
    this.state = this.authStates[2];

    try {
      const user = await global.firebaseApp
        .auth()
        .signInWithEmailAndPassword(credentials.email, credentials.password);

      if (!user.emailVerified) {
        await user.sendEmailVerification();
      }

      const userSnap = await global.firebaseApp
        .database()
        .ref("users")
        .child(user.uid)
        .once("value");

      if (auto) {
        if (!userSnap.val().deviceId) {
          await global.firebaseApp
            .database()
            .ref("users")
            .child(user.uid)
            .update({
              deviceId: Expo.Constants.deviceId
            });
        } else if (userSnap.val().deviceId !== Expo.Constants.deviceId) {
          // if this is not the same device as last time, sign out
          await global.firebaseApp.auth().signOut();
          this.state = this.authStates[0];
          return;
        }
      } else {
        await global.firebaseApp
          .database()
          .ref("users")
          .child(user.uid)
          .update({
            deviceId: Expo.Constants.deviceId,
            pushToken: null,
            settings: {
              notifications: false
            }
          });
      }

      this.watchEmailVerification();

      this.userId = user.uid;
      this.state = this.authStates[1];
      this.watchUserData();
    } catch (err) {
      this.state = this.authStates[0];
      throw err; // throw error again catch in promise callback
    }
  };

  @action watchEmailVerification = () => {
    const emailWatch = setInterval(() => {
      if (global.firebaseApp.auth().currentUser) {
        if (global.firebaseApp.auth().currentUser.emailVerified) {
          this.verified = true;
          clearInterval(emailWatch);
        }
        global.firebaseApp.auth().currentUser.reload();
      }
    }, 1000);
  };

  @action logout = async () => {
    await global.firebaseApp.database().ref("users").child(this.userId).update({
      pushToken: null,
      settings: {
        notifications: false
      }
    });

    this.unWatchUserData();
    await global.firebaseApp.auth().signOut();
    this.userData = {};
    this.state = this.authStates[0];
    this.verified = false;
    this.error = null;
    this.userId = null;
  };

  @action watchUserData = () => {
    global.firebaseApp
      .database()
      .ref("users")
      .child(this.userId)
      .on("value", this.mergeUserData);
  };

  @action unWatchUserData = () => {
    global.firebaseApp
      .database()
      .ref("users")
      .child(this.userId)
      .off("value", this.mergeUserData);
  };

  sendPasswordResetEmail = email => {
    global.firebaseApp.auth().sendPasswordResetEmail(email);
  };

  @action mergeUserData = userSnap => {
    const newUserData = userSnap.val();
    _.merge(this.userData, newUserData);
  };

  @action setError = (error = new Error(""), timeInSeconds = 1) => {
    this.error = error;
    setTimeout(() => {
      this.error = null;
    }, timeInSeconds * 1000);
  };
}

export default new AuthStore();
