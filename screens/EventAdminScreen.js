import React, { Component, PropTypes } from "react";
import {
  StatusBar,
  View,
  StyleSheet,
  LayoutAnimation,
  Platform,
  TextInput,
  ActivityIndicator
} from "react-native";
import { KeepAwake } from "expo";
import { NavigationStyles } from "@expo/ex-navigation";
import colors from "kolors";
import KeyboardEventListener from "KeyboardEventListener";
import Swiper from "react-native-swiper";
import Icon from "../components/CrossPlatformIcon";
import GetEventName from "../components/GetEventName";
import GetEventType from "../components/GetEventType";
import GetEventDate from "../components/GetEventDate";
import GetEventTime from "../components/GetEventTime";
import GetEventUrl from "../components/GetEventUrl";
import GetEventDescription from "../components/GetEventDescription";
import GetEventLocation from "../components/GetEventLocation";
import CancelButton from "../components/NavBarCancelButton";
import moment from "moment";
import filter from "../utils/filter";
import connectDropdownAlert from "../utils/connectDropdownAlert";
import {
  isExponentPushToken,
  sendPushNotificationAsync
} from "../utils/ExponentPushClient";
import _ from "lodash";
import { observable } from "mobx";
import { observer, inject } from "mobx-react/native";

@connectDropdownAlert
@inject("authStore")
@observer
export default class EventAdminScreen extends Component {
  static route = {
    navigationBar: {
      visible: true,
      title({ editMode }) {
        return `${editMode ? "EDIT" : "NEW"} EVENT`;
      },
      tintColor: colors.black,
      renderLeft: () => null,
      renderRight: () => <CancelButton />,
      borderBottomColor: "transparent",
      titleStyle: {
        fontFamily: "open-sans-bold"
      },
      backgroundColor: "white"
    },
    styles: {
      ...NavigationStyles.SlideHorizontal
    }
  };

  static propTypes = {
    navigator: PropTypes.object.isRequired,
    event: PropTypes.object,
    editMode: PropTypes.bool,
    authStore: PropTypes.object.isRequired,
    refresh: PropTypes.func,
    alertWithType: PropTypes.func.isRequired
  };

  @observable name = this.props.event
    ? { name: this.props.event.name }
    : undefined;
  @observable date = this.props.event
    ? { date: moment.utc(this.props.event.date).toDate() }
    : moment.utc().toDate();
  @observable time = this.props.event
    ? {
        time: moment
          .utc(this.props.event.date)
          .add(this.props.event.time.hours, "hours")
          .add(this.props.event.time.minutes, "minutes")
          .toDate()
      }
    : moment.utc().toDate().getTime();
  @observable url = this.props.event ? { url: this.props.event.url || "" } : "";
  @observable submitting = false;
  @observable type = this.props.event
    ? { type: this.props.event.type || "" }
    : undefined;
  @observable description = this.props.event
    ? { description: this.props.event.description || "" }
    : undefined;
  @observable location;
  @observable keyboardHeight = 0;
  @observable swiperHeight = 0;
  @observable swiperWidth = 0;
  @observable references = {};

  createEvent = () => {
    const name = this.name !== undefined && this.name.name;
    const type = this.type !== undefined && this.type.type;
    const date = this.date.date
      ? moment.utc(moment(this.date.date).startOf("day")).toJSON()
      : moment.utc(moment(this.date).startOf("day")).toJSON();
    const time = {
      hours: this.time.time
        ? moment(this.time.time).hours()
        : moment(this.time).hours(),
      minutes: this.time.time
        ? moment(this.time.time).minutes()
        : moment(this.time).minutes()
    };
    const url = this.url && this.url.url;
    const location = {
      address: this.location.details.formatted_address,
      geometry: this.location.details.geometry
    };
    const description =
      this.description !== undefined && this.description.description;
    return {
      name: filter.clean(name.trim()),
      type,
      createdBy: this.props.authStore.userId,
      date,
      time,
      url: url && url.toLowerCase(),
      createdInDev: global.__DEV__,
      location,
      description: description && filter.clean(description.trim())
    };
  };

  checkDataAndPush = () => {
    let propertiesAreValid = true;

    const name = this.name !== undefined ? this.name.name : "";
    const date = this.date.date
      ? moment.utc(moment(this.date.date).startOf("day"))
      : moment.utc(moment(this.date).startOf("day"));
    const time = {
      hours: this.time.time
        ? moment(this.time.time).hours()
        : moment(this.time).hours(),
      minutes: this.time.time
        ? moment(this.time.time).minutes()
        : moment(this.time).minutes()
    };

    if (name !== filter.clean(name)) {
      this.props.alertWithType(
        "error",
        "Error",
        "Please mind your choice of words."
      );
      propertiesAreValid = false;
    }
    if (
      !this.props.editMode &&
      !date
        .add(time.hours, "hours")
        .add(time.minutes, "minutes")
        .isAfter(moment().add(3, "hours"))
    ) {
      this.props.alertWithType(
        "error",
        "Error",
        "Event should be scheduled at least three hours in advance."
      );
      propertiesAreValid = false;
    }
    ["name", "date", "time", "url", "type", "description"].forEach(elem => {
      if (!this.references[elem].isValid()) {
        this.props.alertWithType("error", "Error", `Event ${elem} is invalid.`);
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
    return this.keyboardHeight > 0;
  };

  _onKeyboardVisibilityChange = ({
    keyboardHeight,
    layoutAnimationConfig
  }: { keyboardHeight: number, layoutAnimationConfig: ?Object }) => {
    if (keyboardHeight === 0) {
      this._blurFocusedTextInput();
    }

    if (layoutAnimationConfig) {
      LayoutAnimation.configureNext(layoutAnimationConfig);
    }

    this.keyboardHeight = keyboardHeight;
  };

  submitEvent = event => {
    if (this.submitting) {
      this.props.alertWithType(
        "info",
        "Info",
        "Your submission is in progress."
      );
      return;
    }

    this.submitting = true;

    if (this.props.editMode) {
      global.firebaseApp
        .database()
        .ref("schools")
        .child(this.props.authStore.userData.school)
        .child("events")
        .child(this.props.event.uid)
        .update(event, () => {
          this.props.alertWithType(
            "success",
            "Success",
            "Your event was updated successfully!"
          );
          this.props.refresh();
          this.props.navigator.pop();
        });
    } else {
      global.firebaseApp
        .database()
        .ref("users")
        .child(this.props.authStore.userId)
        .once("value")
        .then(snap => {
          const schoolUID = snap.val().school;
          global.firebaseApp
            .database()
            .ref("schools")
            .child(schoolUID)
            .child("events")
            .push(event)
            .then(() => {
              // send pushes to peers
              global.firebaseApp
                .database()
                .ref("users")
                .once("value")
                .then(usersSnap => {
                  _.each(usersSnap.val(), user => {
                    if (
                      !global.__DEV__ &&
                      isExponentPushToken(user.pushToken) &&
                      user.school === schoolUID
                    ) {
                      sendPushNotificationAsync({
                        exponentPushToken: user.pushToken,
                        message: `There's a new ${event.type.toLowerCase()} event at your school!`
                      }).catch(err => {
                        this.props.alertWithType(
                          "error",
                          "Error",
                          err.toString()
                        );
                      });
                    }
                  });

                  this.props.alertWithType(
                    "success",
                    "Success",
                    "Your event was submitted successfully!"
                  );
                  this.props.refresh();
                  this.props.navigator.pop();
                });
            });
        })
        .catch(err => {
          this.submitting = false;
          this.props.alertWithType("error", "Error", err.toString());
        });
    }
  };

  componentWillMount() {
    this._unsubscribe = KeyboardEventListener.subscribe(
      this._onKeyboardVisibilityChange
    );
  }

  componentWillUnmount() {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }

  render() {
    return (
      <View
        style={[
          styles.container,
          this.keyboardHeight
            ? { flex: 1, marginBottom: this.keyboardHeight }
            : { flex: 1 }
        ]}
        onLayout={e => {
          const { width, height } = e.nativeEvent.layout;
          this.swiperHeight = height;
          this.swiperWidth = width;
        }}
      >
        <KeepAwake />
        <StatusBar barStyle="dark-content" />
        <Choose>
          <When condition={this.submitting}>
            <ActivityIndicator size="large" />
          </When>
          <Otherwise>
            <Swiper
              ref={r => {
                this.references.swiper = r;
              }}
              showsPagination
              onScroll={this._blurFocusedTextInput}
              scrollEventThrottle={32}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode={Platform.OS === "ios" ? "none" : "on-drag"}
              height={this.swiperHeight}
              contentContainerStyle={styles.swiperWrapper}
              showsButtons
              loop={false}
              prevButton={
                <Icon
                  onPress={() => {
                    this.references.swiper.scrollBy(-1, false);
                  }}
                  name="arrow-back"
                  color={colors.black}
                  size={32}
                />
              }
              nextButton={
                <Icon
                  onPress={() => {
                    this.references.swiper.scrollBy(1, false);
                  }}
                  name="arrow-forward"
                  color={colors.black}
                  size={32}
                />
              }
            >
              <GetEventName
                ref={r => {
                  this.references.name = r;
                }}
                value={this.name}
                onChange={name => {
                  this.name = name;
                }}
              />
              <GetEventType
                ref={r => {
                  this.references.type = r;
                }}
                value={this.type}
                onChange={type => {
                  this.type = type;
                }}
              />
              <GetEventDate
                ref={r => {
                  this.references.date = r;
                }}
                value={this.date}
                onChange={date => {
                  this.date = date;
                }}
              />
              <GetEventTime
                ref={r => {
                  this.references.time = r;
                }}
                value={this.time}
                onChange={time => {
                  this.time = time;
                }}
              />
              <GetEventUrl
                ref={r => {
                  this.references.url = r;
                }}
                value={this.url}
                onChange={url => {
                  this.url = url;
                }}
              />
              <GetEventDescription
                ref={r => {
                  this.references.description = r;
                }}
                value={this.description}
                onChange={description => {
                  this.description = description;
                }}
              />
              <GetEventLocation
                location={this.location}
                onLocationSelect={(data, details = null) => {
                  this.location = { data, details };
                }}
                submitting={this.submitting}
                onSubmit={this.checkDataAndPush}
                keyboardHeight={this.keyboardHeight}
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
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center"
  },
  swiperWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
