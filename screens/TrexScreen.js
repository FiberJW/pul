import React, { Component, PropTypes } from 'react';
import {
  WebView,
  StyleSheet,
  ListView,
  View,
  ActivityIndicator,
  Text,
  AppState,
} from 'react-native';
import colors from '../config/colors';
import { NavigationStyles } from '@expo/ex-navigation';
import connectDropdownAlert from '../utils/connectDropdownAlert';
import TrexPlayer from '../components/TrexPlayer';
import { observer, inject } from 'mobx-react/native';

@connectDropdownAlert
@inject('trexStore')
@observer
export default class TrexScreen extends Component {
  static route = {
    navigationBar: {
      visible: true,
      title: 'T-REX GAME',
      borderBottomColor: 'transparent',
      tintColor: colors.black,
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
    alertWithType: PropTypes.func.isRequired,
    trexStore: PropTypes.object.isRequired,
  };

  state = {
    appState: AppState.currentState,
    softBanned: false,
  };

  componentDidMount() {
    this.props.trexStore.watchUsers();
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUpdate(nextProps) {
    if (nextProps.trexStore.error) {
      nextProps.alertWithType(
        'error',
        'Error',
        nextProps.trexStore.error.toString(),
      );
    }
  }

  componentWillUnmount() {
    this.props.trexStore.unWatchUsers();
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.setState({ softBanned: true }); // to prevent guys hacking
      setTimeout(() => this.setState({ softBanned: false }), 30000);
    }
    this.setState({ appState: nextAppState });
  };

  render() {
    return (
      <View style={styles.container}>
        <WebView
          style={styles.webview}
          source={require('../assets/html/x3dcn50pq1.html')}
          scrollEnabled={false}
          javaScriptEnabled
          onMessage={e => {
            if (!this.state.softBanned) {
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
              <View style={styles.labelContainer}>
                <Text style={styles.label}>LEADERBOARD</Text>
              </View>
              <ListView
                enableEmptySections
                dataSource={this.ds.cloneWithRows(
                  this.props.trexStore.players.slice(),
                )}
                renderRow={(player, __, idx) => (
                  <TrexPlayer player={player} place={parseInt(idx, 10) + 1} />
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
    justifyContent: 'space-between',
  },
  activityContainer: {
    flex: 1,
    backgroundColor: colors.eggshell,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
  },
  leaderboard: {
    borderTopColor: colors.disabledGrey,
    borderTopWidth: StyleSheet.hairlineWidth,
    flex: 1,
  },
  labelContainer: {
    padding: 8,
  },
  label: {
    fontFamily: 'open-sans-semibold',
    fontSize: 12,
    color: 'rgba(128, 128, 128, 0.7)',
  },
});
