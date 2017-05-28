import Expo from "expo";
import React, { Component } from "react";
import { sentryURL } from "./config/keys";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import DropdownAlertProvider from "./components/DropdownAlertProvider";
import Sentry from "sentry-expo";
import { Provider as MobXProvider } from "mobx-react/native";
import authStore from "./stores/AuthStore";
import eventStore from "./stores/EventStore";
import trexStore from "./stores/TrexStore";
import uiStore from "./stores/UIStore";
import App from "./components/App";

if (!global.__DEV__) {
  // this guards against console usage in production builds since
  // babel transform of remove console won't work with react-native preset
  Object.keys(console).forEach(methodName => {
    console[methodName] = () => {
      /* noop */
    };
  });
  Sentry.config(sentryURL).install();
}

class Main extends Component {
  render() {
    return (
      <MobXProvider {...{ authStore, eventStore, trexStore, uiStore }}>
        <DropdownAlertProvider>
          <ActionSheetProvider>
            <App />
          </ActionSheetProvider>
        </DropdownAlertProvider>
      </MobXProvider>
    );
  }
}

Expo.registerRootComponent(Main);
