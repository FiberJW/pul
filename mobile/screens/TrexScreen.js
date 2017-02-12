import React, { Component, PropTypes } from 'react';
import {
  WebView,
  StyleSheet,
  ListView,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import colors from '../config/colors';
import { NavigationStyles } from '@exponent/ex-navigation';
import connectDropdownAlert from '../utils/connectDropdownAlert';
import TrexPlayer from '../components/TrexPlayer';
import { observer } from 'mobx-react/native';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

@connectDropdownAlert
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
  }

  static propTypes = {
    alertWithType: PropTypes.func.isRequired,
    trexStore: PropTypes.object.isRequired,
  }

  componentDidMount() {
    this.props.trexStore.watchUsers();
  }

  componentWillUpdate(nextProps) {
    if (nextProps.trexStore.error) {
      nextProps.alertWithType('error', 'Error', nextProps.trexStore.error.toString());
    }
  }

  componentWillUnmount() {
    this.props.trexStore.unWatchUsers();
  }

  render() {
    return (
      <View
        style={ styles.container }
      >
        <WebView
          style={ styles.webview }
          source={ require('../assets/html/t-rex.html') }
          scrollEnabled={ false }
          javaScriptEnabled
          onMessage={ (e) => {
            const highestScore = JSON.parse(e.nativeEvent.data).highestScore;
            this.props.trexStore.addNewHighScore(highestScore);
          } }
        />
        <Choose>
          <When condition={ this.props.trexStore.loading }>
            <View style={ styles.activityContainer }>
              <ActivityIndicator size="large" />
            </View>
          </When>
          <Otherwise>
            <View style={ styles.leaderboard }>
              <View style={ styles.labelContainer }>
                <Text style={ styles.label }>LEADERBOARD</Text>
              </View>
              <ListView
                enableEmptySections
                dataSource={ ds.cloneWithRows(this.props.trexStore.players.slice()) }
                renderRow={ (player, __, idx) => <TrexPlayer player={ player } place={ parseInt(idx, 10) + 1 } /> }
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
    height: 300,
    flex: 0,
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
