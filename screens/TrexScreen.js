import React, { Component, PropTypes } from "react";
import {
  WebView,
  StyleSheet,
  FlatList,
  View,
  ActivityIndicator,
  AppState
} from "react-native";
import colors from "kolors";
import { NavigationStyles } from "@expo/ex-navigation";
import connectDropdownAlert from "../utils/connectDropdownAlert";
import TrexPlayer from "../components/TrexPlayer";
import { observer, inject } from "mobx-react/native";
import { observable } from "mobx";
import WidgetLabel from "../components/styled/WidgetLabel";

@connectDropdownAlert
@inject("trexStore")
@observer
export default class TrexScreen extends Component {
  static route = {
    navigationBar: {
      visible: true,
      title: "T-REX GAME",
      borderBottomColor: "transparent",
      tintColor: colors.black,
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
    alertWithType: PropTypes.func.isRequired,
    trexStore: PropTypes.object.isRequired
  };

  @observable appState = AppState.currentState;
  @observable softBanned = false;

  _handleAppStateChange = nextAppState => {
    if (
      this.appState.match(/inactive|background/) && nextAppState === "active"
    ) {
      this.softBanned = true;
      setTimeout(() => {
        this.softBanned = false;
      }, 30000);
    }
    this.appState = nextAppState;
  };

  componentDidMount() {
    this.props.trexStore.watchUsers();
    AppState.addEventListener("change", this._handleAppStateChange);
  }

  componentWillUpdate(nextProps) {
    if (nextProps.trexStore.error) {
      nextProps.alertWithType(
        "error",
        "Error",
        nextProps.trexStore.error.toString()
      );
    }
  }

  componentWillUnmount() {
    this.props.trexStore.unWatchUsers();
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  render() {
    return (
      <View style={styles.container}>
        <WebView
          style={styles.webview}
          source={require("../assets/html/x3dcn50pq1.html")}
          scrollEnabled={false}
          javaScriptEnabled
          onMessage={e => {
            if (!this.softBanned) {
              const highestScore = JSON.parse(e.nativeEvent.data).highestScore;
              this.props.trexStore.addNewHighScore(highestScore);
            }
          }}
        />
        <Choose>
          <When condition={this.props.trexStore.loading}>
            <View style={styles.activityContainer}>
              <ActivityIndicator size="large" />
            </View>
          </When>
          <Otherwise>
            <View style={styles.leaderboard}>
              <WidgetLabel label="LEADERBOARD" />
              <FlatList
                keyExtractor={(item, i) => i}
                data={this.props.trexStore.players.slice()}
                renderItem={({ item, index }) => (
                  <TrexPlayer player={item} place={parseInt(index, 10) + 1} />
                )}
              />
            </View>
          </Otherwise>
        </Choose>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.eggshell,
    justifyContent: "space-between"
  },
  activityContainer: {
    flex: 1,
    backgroundColor: colors.eggshell,
    justifyContent: "center",
    alignItems: "center"
  },
  webview: {
    flex: 1
  },
  leaderboard: {
    borderTopColor: colors.disabledGrey,
    borderTopWidth: StyleSheet.hairlineWidth,
    flex: 1
  }
});
