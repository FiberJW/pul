import React, { Component, PropTypes } from 'react';
import {
  View,
  ListView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Image,
  Vibration,
  Platform,
  Text,
  RefreshControl,
} from 'react-native';
import Event from '../components/Event';
import ActionButton from 'react-native-action-button';
import colors from '../config/colors';
import Icon from '../components/CrossPlatformIcon';
import { NavigationStyles } from '@exponent/ex-navigation';
import Router from '../navigation/Router';
import connectDropdownAlert from '../utils/connectDropdownAlert';
import { observer, inject } from 'mobx-react/native';

/**
 *  Shows a list of all of your school's future events
 */
@connectDropdownAlert
@inject('eventStore') @observer
export default class HomeScreen extends Component {
  static route = {
    styles: {
      ...NavigationStyles.Fade,
    },
  }

  static propTypes = {
    navigator: PropTypes.object,
    alertWithType: PropTypes.func.isRequired,
    navigation: PropTypes.object,
    eventStore: PropTypes.object,
  }

  componentWillUpdate(nextProps) {
    if (nextProps.eventStore.error) {
      nextProps.alertWithType('error', 'Error', nextProps.eventStore.error.toString());
    }
  }

  ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })

  render() {
    return (
      <View
        style={ styles.container }
      >
        <StatusBar barStyle="dark-content" />
        <Choose>
          <When condition={ this.props.eventStore.loading }>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
              }}
            >
              <ActivityIndicator size="large" />
            </View>
          </When>
          <When condition={ this.props.eventStore.events.length || this.props.eventStore.refreshing }>
            <ListView
              enableEmptySections
              style={{ marginTop: 4 }}
              dataSource={ this.ds.cloneWithRows(this.props.eventStore.events.slice()) }
              refreshControl={
                <RefreshControl
                  enabled
                  colors={ [colors.blue, colors.hotPink] }
                  refreshing={ this.props.eventStore.refreshing }
                  onRefresh={ this.props.eventStore.refresh }
                />
              }
              renderRow={ event => <Event event={ event } refresh={ this.props.eventStore.refresh } /> }
            />
          </When>
          <Otherwise>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Image
                resizeMode="contain"
                style={{
                  width: 150,
                  height: 150,
                  opacity: 0.3,
                }}
                source={ require('pul/assets/images/PokerFace.png') }
              />
              <Text
                style={{
                  marginTop: 16,
                  fontFamily: 'open-sans',
                  fontSize: 18,
                  paddingHorizontal: 8,
                  color: '#AEAEAF',
                  textAlign: 'center',
                }}
              >
                No events? Your school must be pretty lame.
              </Text>
            </View>
          </Otherwise>
        </Choose>
        <ActionButton
          offsetX={ 16 }
          offsetY={ Platform.OS === 'android' ? 16 : 0 }
          onPress={ () => {
            if (global.firebaseApp.auth().currentUser.emailVerified) {
              this.props.navigation
              .getNavigator('master')
              .push(Router.getRoute('newEvent', { refresh: this.props.eventStore.refresh }));
            } else {
              this.props.alertWithType('error', 'Error', 'You must verify your email before continuing.');
            }
          } }
          onLongPress={ () => {
            Vibration.vibrate([0, 25]);
            if (global.firebaseApp.auth().currentUser.emailVerified) {
              this.props.navigation
              .getNavigator('master')
              .push(Router.getRoute('trex'));
            } else {
              this.props.alertWithType('error', 'Error', 'You must verify your email before continuing.');
            }
          } }
          buttonColor={ colors.black }
          icon={
            <Icon
              name="add"
              size={ 24 }
              color="white"
            />
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.eggshell,
  },
});
