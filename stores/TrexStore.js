import { observable, action } from "mobx";
import _ from "lodash";
import { create, persist } from "mobx-persist";
import {
  isExponentPushToken,
  sendPushNotificationAsync
} from "../utils/ExponentPushClient";
import { AsyncStorage } from "react-native";
import authStore from "./AuthStore";

export class TrexStore {
  @persist("list")
  @observable
  players = [];

  @persist
  @observable
  loading = true;

  @persist
  @observable
  schoolUID = null;

  @persist
  @observable
  error = null;

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

  @action setError = (error, timeInSeconds = 1) => {
    this.error = error;
    setTimeout(() => {
      this.error = null;
    }, timeInSeconds * 1000);
  };

  @action updateLeaderboard = yourSchool => usersSnapshot => {
    const newPlayers = [];
    const users = usersSnapshot.val();
    _.each(users, (user, uid) => {
      if (user.trexHighestScore && user.school === yourSchool) {
        newPlayers.push({ ...user, uid });
      }
    });

    const sorted = _.sortBy(newPlayers, ["trexHighestScore"]);
    sorted.reverse();

    this.players = sorted;
    this.loading = false;
  };

  @action watchUsers = () => {
    global.firebaseApp
      .database()
      .ref("users")
      .child(global.firebaseApp.auth().currentUser.uid)
      .once("value")
      .then(userSnap => {
        this.schoolUID = userSnap.val().school;

        global.firebaseApp
          .database()
          .ref("users")
          .on("value", this.updateLeaderboard(this.schoolUID));
      })
      .catch(error => {
        this.setError(error);
      });
  };

  unWatchUsers = () => {
    global.firebaseApp
      .database()
      .ref("users")
      .off("value", this.updateLeaderboard(this.schoolUID));
  };

  @action addNewHighScore = score => {
    let highestScore;
    if (highestScore > 10000) {
      highestScore = -Math.abs(score);
    } else {
      highestScore = score;
    }

    global.firebaseApp
      .database()
      .ref("users")
      .child(global.firebaseApp.auth().currentUser.uid)
      .once("value")
      .then(userSnap => {
        const user = userSnap.val();
        if (user.trexHighestScore) {
          if (user.trexHighestScore < highestScore) {
            global.firebaseApp
              .database()
              .ref("users")
              .child(global.firebaseApp.auth().currentUser.uid)
              .update(
                {
                  trexHighestScore: highestScore
                },
                () => {
                  global.firebaseApp
                    .database()
                    .ref("users")
                    .once("value")
                    .then(usersSnap => {
                      _.each(usersSnap.val(), peer => {
                        if (
                          !global.__DEV__ &&
                          isExponentPushToken(peer.pushToken) &&
                          peer.school === this.props.event.schoolUID &&
                          peer.trexHighestScore
                        ) {
                          sendPushNotificationAsync({
                            exponentPushToken: peer.pushToken,
                            message: `${authStore.userData.displayName} just leveled up in T-rex!`
                          }).catch(err => {
                            this.props.alertWithType(
                              "error",
                              "Error",
                              err.toString()
                            );
                          });
                        }
                      });
                    });
                }
              );
          }
        } else {
          global.firebaseApp
            .database()
            .ref("users")
            .child(global.firebaseApp.auth().currentUser.uid)
            .update(
              {
                trexHighestScore: highestScore
              },
              () => {
                global.firebaseApp
                  .database()
                  .ref("users")
                  .once("value")
                  .then(usersSnap => {
                    _.each(usersSnap.val(), peer => {
                      if (
                        !global.__DEV__ &&
                        isExponentPushToken(peer.pushToken) &&
                        peer.school === this.props.event.schoolUID &&
                        peer.trexHighestScore
                      ) {
                        sendPushNotificationAsync({
                          exponentPushToken: peer.pushToken,
                          message: `${authStore.userData.displayName} just began playing T-rex!`
                        }).catch(err => {
                          this.props.alertWithType(
                            "error",
                            "Error",
                            err.toString()
                          );
                        });
                      }
                    });
                  });
              }
            );
        }
      })
      .catch(error => {
        this.setError(error);
      });
  };

  @action reset = () => {
    this.unWatchUsers();
    this.players = [];
    this.loading = true;
    this.schoolUID = null;
    this.error = null;
  };
}

export default new TrexStore();
