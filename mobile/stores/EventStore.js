import { observable, action, computed } from 'mobx';
import _ from 'lodash';
import moment from 'moment';

export default class EventStore {
  @observable loading = true;
  @observable refreshing = false;
  @observable error = null;
  @observable school = null;
  @observable events = [];

  @action processEvents = schoolUID => eventsSnapshot => {
    const rawEvents = _.map(eventsSnapshot.val() || {}, (event, uid) => {
      let availableRides = 0;

      const rides = _.map(event.rides || {}, (ride, rideUID) => {
        const passengers = _.map(ride.passengers || {}, (passenger, passUID) => ({ ...passenger, passUID }));

        if (!passengers || passengers.length < event.rides[rideUID].passengerLimit) {
          availableRides++;
        }

        return { ...ride, uid: rideUID, passengers };
      });

      return {
        ...event,
        uid,
        availableRides,
        schoolUID,
        rides,
      };
    }).reverse();

    this.school = schoolUID;
    this.events = rawEvents.filter(event => {
      return moment(event.date)
        .add(event.time.hours, 'hours')
        .add(event.time.minutes, 'minutes')
        .isAfter(moment());
    }).sort((leftEvent, rightEvent) => {
      return moment(leftEvent.date)
        .add(leftEvent.time.hours, 'hours')
        .add(leftEvent.time.minutes, 'minutes')
        .diff(
          moment(rightEvent.date)
          .add(rightEvent.time.hours, 'hours')
          .add(rightEvent.time.minutes, 'minutes')
        );
    });
    this.loading = false;
    this.refreshing = false;
    this.error = null;
  }

  @action watchEvents = (refresh = false) => {
    if (refresh) {
      this.refreshing = true;
    }

    global.firebaseApp.database()
    .ref('users')
    .child(global.firebaseApp.auth().currentUser.uid)
    .once('value')
    .then(userSnap => {
      const schoolUID = userSnap.val().school;
      global.firebaseApp.database()
      .ref('schools')
      .child(schoolUID)
      .child('events')
      .on('value', this.processEvents(schoolUID));
      this.error = null;
    })
    .catch(error => {
      this.setError(error);
    });
  }

  @action unWatchEvents = () => {
    global.firebaseApp.database()
    .ref('schools')
    .child(this.school)
    .child('events')
    .off('value', this.processEvents(this.school));
  }

  @action refresh = (showRefreshControl = true) => {
    this.unWatchEvents();
    this.events = [];
    this.error = null;
    this.watchEvents(showRefreshControl);
  }

  @action setError = (error, timeInSeconds = 1) => {
    this.error = error;
    setTimeout(() => {
      this.error = null;
    }, timeInSeconds * 1000);
  }

  @computed get rides() {
    const yourEvents = this.events.filter((event) => {
      return event.rides && event.rides.some(ride => {
        return ride.driver === global.firebaseApp.auth().currentUser.uid ||
          ride.passengers.some(passenger => passenger.userUID === global.firebaseApp.auth().currentUser.uid);
      });
    });

    return yourEvents.map(event => {
      let yourRide;
      if (event.rides) {
        event.rides.forEach(ride => {
          if (!ride.rideCompleted && (ride.driver === global.firebaseApp.auth().currentUser.uid ||
              ride.passengers.some(passenger => passenger.userUID === global.firebaseApp.auth().currentUser.uid))) {
            yourRide = ride;
          }
        });
      }

      return { ...event, yourRide };
    });
  }
}
