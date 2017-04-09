/**
 * @providesModule KeyboardEventListener
 * @flow
 */

import type EmitterSubscription from "EmitterSubscription";
import { LayoutAnimation, Keyboard, Platform } from "react-native";

/**
 *  Listens to Keyboard Events
 */
export default class KeyboardEventListener {
  _callback: () => void;
  _keyboardDidChangeSubscription: ?EmitterSubscription;
  _keyboardDidShowSubscription: ?EmitterSubscription;
  _keyboardDidHideSubscription: ?EmitterSubscription;

  /**
   *  It allows one to subscribe to these Events
   *  @param {Function} callback - is called when event changes
   */
  static subscribe(callback) {
    const listener = new KeyboardEventListener(callback);
    return () => {
      listener.unsubscribe();
    };
  }

  /**
   *  callback is what you want to do when something changes
   *  @type {Function}
   */
  constructor(callback: () => void) {
    this._callback = callback;

    if (Platform.OS === "ios") {
      this._keyboardDidChangeSubscription = Keyboard.addListener(
        "keyboardWillChangeFrame",
        this._onKeyboardChange
      );
    } else {
      this._keyboardDidShowSubscription = Keyboard.addListener(
        "keyboardDidShow",
        this._onKeyboardChange
      );
      this._keyboardDidHideSubscription = Keyboard.addListener(
        "keyboardDidHide",
        this._onKeyboardChange
      );
    }
  }

  /**
   *  unsubscribes from the KeyboardEventListener
   */
  unsubscribe() {
    if (this._keyboardDidChangeSubscription)
      this._keyboardDidChangeSubscription.remove();
    if (this._keyboardDidShowSubscription)
      this._keyboardDidShowSubscription.remove();
    if (this._keyboardDidHideSubscription)
      this._keyboardDidHideSubscription.remove();
  }

  _onKeyboardChange = (event: any) => {
    if (!event) {
      this._callback({ keyboardHeight: 0 });
      return;
    }

    const { duration, easing, startCoordinates, endCoordinates } = event;

    let keyboardHeight;
    if (
      Platform.OS === "ios" && endCoordinates.screenY > startCoordinates.screenY
    ) {
      keyboardHeight = 0;
    } else if (
      Platform.OS === "ios" &&
      endCoordinates.screenY === startCoordinates.screenY
    ) {
      // Just return -- not sure where this event comes from and seems unnecessary
      return;
    } else {
      keyboardHeight = endCoordinates.height;
    }

    let layoutAnimationConfig;
    if (duration && easing) {
      layoutAnimationConfig = {
        duration,
        update: {
          duration,
          type: LayoutAnimation.Types[easing] || "keyboard"
        }
      };
    }

    this._callback({ keyboardHeight, layoutAnimationConfig });
  };
}
