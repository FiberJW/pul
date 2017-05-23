import { observable, action, computed } from "mobx";
import _ from "lodash";
import moment from "moment";
import { create, persist } from "mobx-persist";
import { AsyncStorage } from "react-native";

export class EventStore {
  @persist
  @observable
  loading = true;

  @persist
  @observable
  refreshing = false;

  @persist
  @observable
  error = null;

  @persist
  @observable
  schoolUID = null;

  @persist("list")
  @observable
  events = [];

  constructor() {
    this.hydrate();
  }

  @action processEvents = schoolUID => eventsSnapshot => {
    this.events = [];
    const rawEvents = _.map(eventsSnapshot.val() || {}, (event, uid) => {
      let availableRides = 0;

      const rides = _.map(event.rides || {}, (ride, rideUID) => {
        const passengers = _.map(
          ride.passengers || {},
          (passenger, passUID) => ({ ...passenger, passUID, key: passUID })
        );

        if (
          (!passengers ||
            passengers.length < event.rides[rideUID].passengerLimit) &&
          !event.rides[rideUID].rideStarted
        ) {
          availableRides++;
        }

        return { ...ride, uid: rideUID, key: rideUID, passengers };
      });

      const likes = _.map(event.likes || {}, (liked, user) => ({
        user,
        liked
      }))
        .filter(({ liked }) => liked)
        .map(o => o.user);

      return {
        ...event,
        uid,
        availableRides,
        schoolUID,
        rides,
        key: uid,
        likes
      };
    }).reverse();

    this.events = rawEvents
      .filter(event => {
        return moment(event.date)
          .add(event.time.hours, "hours")
          .add(event.time.minutes, "minutes")
          .isAfter(moment().startOf("day"));
      })
      .sort((leftEvent, rightEvent) => {
        return moment(leftEvent.date)
          .add(leftEvent.time.hours, "hours")
          .add(leftEvent.time.minutes, "minutes")
          .diff(
            moment(rightEvent.date)
              .add(rightEvent.time.hours, "hours")
              .add(rightEvent.time.minutes, "minutes")
          );
      })
      .sort((a, b) => b.likes.length - a.likes.length)
      .slice(0, 100);
    this.schoolUID = schoolUID;
    this.loading = false;
    this.refreshing = false;
    this.error = null;
  };

  @action watchEvents = (refresh = false) => {
    if (refresh) {
      this.refreshing = true;
    }

    global.firebaseApp
      .database()
      .ref("users")
      .child(global.firebaseApp.auth().currentUser.uid)
      .once("value")
      .then(userSnap => {
        const schoolUID = userSnap.val().school;
        global.firebaseApp
          .database()
          .ref("schools")
          .child(schoolUID)
          .child("events")
          .on("value", this.processEvents(schoolUID));
        this.error = null;
      })
      .catch(error => {
        this.setError(error);
      });
  };

  @action unWatchEvents = () => {
    global.firebaseApp
      .database()
      .ref("schools")
      .child(this.schoolUID)
      .child("events")
      .off("value", this.processEvents(this.schoolUID));
  };

  @action refresh = (showRefreshControl = true) => {
    this.unWatchEvents();
    this.events = [];
    this.error = null;
    this.watchEvents(showRefreshControl);
  };

  @action setError = (error, timeInSeconds = 1) => {
    this.error = error;
    setTimeout(() => {
      this.error = null;
    }, timeInSeconds * 1000);
  };

  @action reset = () => {
    this.unWatchEvents();
    this.loading = true;
    this.refreshing = false;
    this.error = null;
    this.schoolUID = null;
    this.events = [];
  };

  @computed get rides() {
    return this.events
      .filter(event => {
        return (
          event.rides &&
          event.rides.some(ride => {
            return (
              ride.driver === global.firebaseApp.auth().currentUser.uid ||
              ride.passengers.some(
                passenger =>
                  passenger.userUID ===
                  global.firebaseApp.auth().currentUser.uid
              )
            );
          })
        );
      })
      .map(event => {
        let yourRide;
        if (event.rides) {
          event.rides.forEach(ride => {
            if (
              ride.driver === global.firebaseApp.auth().currentUser.uid ||
              ride.passengers.some(
                passenger =>
                  passenger.userUID ===
                  global.firebaseApp.auth().currentUser.uid
              )
            ) {
              yourRide = ride;
            }
          });
        }

        return { ...event, yourRide };
      });
  }

  @action hydrate = () => {
    const pour = create({
      storage: AsyncStorage
    });

    Object.keys(this).forEach(key => {
      pour(key, this);
    });
  };
}

export default new EventStore();
