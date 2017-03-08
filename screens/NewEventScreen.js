import React, { Component, PropTypes } from 'react';
import {
  StatusBar,
  View,
  StyleSheet,
  LayoutAnimation,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { NavigationStyles } from '@expo/ex-navigation';
import colors from '../config/colors';
import KeyboardEventListener from 'KeyboardEventListener';
import Swiper from 'react-native-swiper';
import Icon from '../components/CrossPlatformIcon';
import GetEventName from '../components/GetEventName';
import GetEventType from '../components/GetEventType';
import GetEventDate from '../components/GetEventDate';
import GetEventTime from '../components/GetEventTime';
import GetEventUrl from '../components/GetEventUrl';
import GetEventDescription from '../components/GetEventDescription';
import GetEventLocation from '../components/GetEventLocation';
import CancelButton from '../components/NavBarCancelButton';
import moment from 'moment';
import filter from '../utils/filter';
import connectDropdownAlert from '../utils/connectDropdownAlert';
import {
  isExponentPushToken,
  sendPushNotificationAsync,
} from '../utils/ExponentPushClient';
import _ from 'lodash';
/**
 *  Allows user to create new events for school
 */
@connectDropdownAlert
export default class NewEventScreen extends Component {
  static route = {
    navigationBar: {
      visible: true,
      title: 'NEW EVENT',
      tintColor: colors.black,
      renderLeft: () => null,
      renderRight: () => <CancelButton />,
      borderBottomColor: 'transparent',
      titleStyle: {
        fontFamily: 'open-sans-bold',
      },
      backgroundColor: 'white',
    },
    styles: {
      ...NavigationStyles.SlideHorizontal,
    },
  };

  static propTypes = {
    navigator: PropTypes.object.isRequired,
    refresh: PropTypes.func,
    alertWithType: PropTypes.func.isRequired,
  };

  state = {
    name: null,
    date: moment.utc().toDate(),
    time: moment.utc().toDate().getTime(),
    url: '',
    submitting: false,
    type: null,
    description: null,
    location: null,
    keyboardHeight: 0,
  };

  componentWillMount() {
    this._unsubscribe = KeyboardEventListener.subscribe(
      this._onKeyboardVisibilityChange,
    );
  }

  componentWillUnmount() {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }

  createEvent = () => {
    const name = this.state.name !== null && this.state.name.name;
    const type = this.state.type !== null && this.state.type.type;
    const date = this.state.date.date
      ? moment.utc(moment(this.state.date.date).startOf('day')).toJSON()
      : moment.utc(moment(this.state.date).startOf('day')).toJSON();
    const time = {
      hours: this.state.time.time
        ? moment(this.state.time.time).hours()
        : moment(this.state.time).hours(),
      minutes: this.state.time.time
        ? moment(this.state.time.time).minutes()
        : moment(this.state.time).minutes(),
    };
    const url = this.state.url.url || this.state.url;
    const location = {
      address: this.state.location.details.formatted_address,
      geometry: this.state.location.details.geometry,
    };
    const description = this.state.description !== null &&
      this.state.description.description;
    return {
      name: filter.clean(name.trim()),
      type,
      createdBy: global.firebaseApp.auth().currentUser.uid,
      date,
      time,
      url: url.toLowerCase(),
      createdInDev: __DEV__,
      location,
      description: description && filter.clean(description.trim()),
    };
  };

  checkDataAndPush = () => {
    let propertiesAreValid = true;

    const name = this.state.name !== null ? this.state.name.name : '';
    const date = this.state.date.date
      ? moment.utc(moment(this.state.date.date).startOf('day'))
      : moment.utc(moment(this.state.date).startOf('day'));
    const time = {
      hours: this.state.time.time
        ? moment(this.state.time.time).hours()
        : moment(this.state.time).hours(),
      minutes: this.state.time.time
        ? moment(this.state.time.time).minutes()
        : moment(this.state.time).minutes(),
    };

    if (name !== filter.clean(name)) {
      this.props.alertWithType(
        'error',
        'Error',
        'Please mind your choice of words.',
      );
      propertiesAreValid = false;
    }
    if (
      !date
        .add(time.hours, 'hours')
        .add(time.minutes, 'minutes')
        .isAfter(moment().add(3, 'hours'))
    ) {
      this.props.alertWithType(
        'error',
        'Error',
        'Event should be scheduled at least three hours in advance.',
      );
      propertiesAreValid = false;
    }
    ['name', 'date', 'time', 'url', 'type', 'description'].forEach(elem => {
      if (!this[elem].isValid()) {
        this.props.alertWithType('error', 'Error', `Event ${elem} is invalid.`);
        propertiesAreValid = false;
      }
    });
    if (propertiesAreValid) {
      this.submitEvent(this.createEvent());
    }
  };

  _blurFocusedTextInput = () => {
    TextInput.State.blurTextInput(TextInput.State.currentlyFocusedField());
  };

  _isKeyboardOpen = () => {
    return this.state.keyboardHeight > 0;
  };

  _onKeyboardVisibilityChange = (
    {
      keyboardHeight,
      layoutAnimationConfig,
    }: { keyboardHeight: number, layoutAnimationConfig: ?Object },
  ) => {
    if (keyboardHeight === 0) {
      this._blurFocusedTextInput();
    }

    if (layoutAnimationConfig) {
      LayoutAnimation.configureNext(layoutAnimationConfig);
    }

    this.setState(() => {
      return { keyboardHeight };
    });
  };

  submitEvent = event => {
    if (this.state.submitting) {
      this.props.alertWithType(
        'info',
        'Info',
        'Your submission is in progress.',
      );
      return;
    }

    this.setState(() => {
      return { submitting: true };
    });

    global.firebaseApp
      .database()
      .ref('users')
      .child(global.firebaseApp.auth().currentUser.uid)
      .once('value')
      .then(snap => {
        const schoolUID = snap.val().school;
        global.firebaseApp
          .database()
          .ref('schools')
          .child(schoolUID)
          .child('events')
          .push(event)
          .then(() => {
            // send pushes to peers
            global.firebaseApp
              .database()
              .ref('users')
              .once('value')
              .then(usersSnap => {
                _.each(usersSnap.val(), user => {
                  if (
                    !__DEV__ &&
                    isExponentPushToken(user.pushToken) &&
                    user.school === schoolUID
                  ) {
                    sendPushNotificationAsync({
                      exponentPushToken: user.pushToken,
                      message: `There's a new ${event.type.toLowerCase()} event at your school!`,
                    }).catch(err => {
                      this.props.alertWithType(
                        'error',
                        'Error',
                        err.toString(),
                      );
                    });
                  }
                });

                this.props.alertWithType(
                  'success',
                  'Success',
                  'Your event was submitted successfully!',
                );
                this.props.refresh();
                this.props.navigator.pop();
              });
          });
      })
      .catch(err => {
        this.setState(() => {
          return { submitting: false };
        });
        this.props.alertWithType('error', 'Error', err.toString());
      });
  };

  render() {
    return (
      <View
        style={[
          styles.container,
          this.state.keyboardHeight
            ? { flex: 1, marginBottom: this.state.keyboardHeight }
            : { flex: 1 },
        ]}
        onLayout={e => {
          const { width, height } = e.nativeEvent.layout;
          this.setState(() => {
            return {
              swiperHeight: height,
              swiperWidth: width,
            };
          });
        }}>
        <StatusBar barStyle="dark-content" />
        <Choose>
          <When condition={this.state.submitting}>
            <ActivityIndicator size="large" />
          </When>
          <Otherwise>
            <Swiper
              ref={r => {
                this.swiper = r;
              }}
              showsPagination
              onScroll={this._blurFocusedTextInput}
              scrollEventThrottle={32}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode={Platform.OS === 'ios' ? 'none' : 'on-drag'}
              height={this.state.swiperHeight}
              contentContainerStyle={styles.swiperWrapper}
              showsButtons
              loop={false}
              prevButton={
                (
                  <Icon
                    onPress={() => {
                      this.swiper.scrollBy(-1, false);
                    }}
                    name="arrow-back"
                    color={colors.black}
                    size={32}
                  />
                )
              }
              nextButton={
                (
                  <Icon
                    onPress={() => {
                      this.swiper.scrollBy(1, false);
                    }}
                    name="arrow-forward"
                    color={colors.black}
                    size={32}
                  />
                )
              }>
              <GetEventName
                ref={r => {
                  this.name = r;
                }}
                value={this.state.name}
                onChange={name => {
                  this.setState(() => ({ name }));
                }}
              />
              <GetEventType
                ref={r => {
                  this.type = r;
                }}
                value={this.state.type}
                onChange={type => {
                  this.setState(() => ({ type }));
                }}
              />
              <GetEventDate
                ref={r => {
                  this.date = r;
                }}
                value={this.state.date}
                onChange={date => {
                  this.setState(() => ({ date }));
                }}
              />
              <GetEventTime
                ref={r => {
                  this.time = r;
                }}
                value={this.state.time}
                onChange={time => {
                  this.setState(() => ({ time }));
                }}
              />
              <GetEventUrl
                ref={r => {
                  this.url = r;
                }}
                value={this.state.url}
                onChange={url => {
                  this.setState(() => ({ url }));
                }}
              />
              <GetEventDescription
                ref={r => {
                  this.description = r;
                }}
                value={this.state.description}
                onChange={description => {
                  this.setState(() => ({ description }));
                }}
              />
              <GetEventLocation
                location={this.state.location}
                onLocationSelect={(data, details = null) => {
                  this.setState(() => ({ location: { data, details } }));
                }}
                submitting={this.state.submitting}
                onSubmit={this.checkDataAndPush}
                keyboardHeight={this.state.keyboardHeight}
              />
            </Swiper>
          </Otherwise>
        </Choose>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swiperWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
