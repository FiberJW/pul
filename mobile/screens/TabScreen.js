import React, { Component, PropTypes } from 'react';
import {
  StackNavigation,
  SlidingTabNavigation,
  SlidingTabNavigationItem,
} from '@exponent/ex-navigation';
import { View, StyleSheet } from 'react-native';
import Icon from '../components/CrossPlatformIcon';
import colors from '../config/colors';
import ShareButton from '../components/ShareButton';
import NavbarTitle from '../components/NavbarTitle';
import Router from '../navigation/Router';
import { observer } from 'mobx-react/native';

@observer(['eventStore'])
export default class TabScreen extends Component {
  static route = {
    navigationBar: {
      visible: true,
      renderTitle: () => <NavbarTitle />,
      renderRight: () => <ShareButton />,
      borderBottomColor: 'transparent',
      backgroundColor: 'white',
      ...SlidingTabNavigation.navigationBarStyles,
    },
  }

  static propTypes = {
    eventStore: PropTypes.object,
  }

  componentDidMount() {
    this.props.eventStore.watchEvents();
  }

  _renderLabel = ({ route }) => {
    switch (route.key) {
      case 'ride':
        return (
          <Icon
            name="car"
            size={ 32 }
            color={ colors.black }
          />
        );
      case 'home':
        return (
          <Icon
            name="calendar"
            size={ 32 }
            color={ colors.black }
          />
        );
      case 'settings':
        return (
          <Icon
            name="settings"
            size={ 32 }
            color={ colors.black }
          />
        );
      default:
        return undefined;
    }
  };

  render() {
    return (
      <View style={ styles.container }>
        <SlidingTabNavigation
          id="main"
          navigatorUID="main"
          renderLabel={ this._renderLabel }
          barBackgroundColor="white"
          indicatorStyle={{ backgroundColor: colors.black }}
          initialTab="home"
        >
          <SlidingTabNavigationItem
            id="ride"
          >
            <StackNavigation
              id="ride"
              navigatorUID="ride"
              initialRoute={ Router.getRoute('upcoming') }
            />
          </SlidingTabNavigationItem>
          <SlidingTabNavigationItem
            id="home"
          >
            <StackNavigation
              id="home"
              navigatorUID="home"
              initialRoute={ Router.getRoute('home') }
            />
          </SlidingTabNavigationItem>
          <SlidingTabNavigationItem
            id="settings"
          >
            <StackNavigation
              id="settings"
              navigatorUID="settings"
              initialRoute={ Router.getRoute('settings') }
            />
          </SlidingTabNavigationItem>
        </SlidingTabNavigation>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
