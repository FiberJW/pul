import React, { Component, PropTypes } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  ListView,
  ActivityIndicator,
} from 'react-native';
import { NavigationStyles } from '@exponent/ex-navigation';
import colors from '../config/colors';
import ElevatedView from 'react-native-elevated-view';
import shuffle from '../utils/shuffle';
import connectDropdownAlert from '../utils/connectDropdownAlert';

/**
 *  For setting where you want to get picked up as a rider
 */
@connectDropdownAlert
export default class SetPickupLocationScreen extends Component {
  static route = {
    navigationBar: {
      visible: true,
      title: 'SET PICKUP LOCATION',
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
    navigator: PropTypes.object.isRequired,
    event: PropTypes.object.isRequired,
    navigation: PropTypes.object.isRequired,
    refresh: PropTypes.func,
    alertWithType: PropTypes.func.isRequired,
  }

  state = {
    location: '',
    pickupLocations: [],
    loading: true,
  }

  /**
   *  Called when component is scheduled to render
   */
  componentWillMount() {
    global.firebaseApp.database().ref('schools')
      .child(this.props.event.schoolUID)
      .child('pickupLocations')
      .once('value')
      .then(pulSnap => {
        const pickupLocations = Object.keys(pulSnap.val()).map(key => {
          return pulSnap.val()[key];
        });
        this.setState(() => {
          return {
            pickupLocations,
            loading: false,
          };
        });
      })
      .catch(err => {
        this.setState(() => {
          return {
            loading: false,
          };
        });
        this.props.alertWithType('error', 'Error', err.toString());
      });
  }

  ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })

  renderOption = (location) => {
    return (
      <TouchableOpacity
        onPress={ () => this.setState(() => {
          return { location: location.name };
        }) }
        style={ styles.radioContainer }
      >
        <View style={ styles.buttonLabelContainer }>
          <View style={ styles.outerCircle }>
            { !!(this.state.location === location.name) && <View style={ styles.innerCircle } /> }
          </View>
          <Text style={ styles.label }>{location.name}</Text>
        </View>
      </TouchableOpacity>
    );
  }


  requestRide = () => {
    if (this.state.location === '') {
      this.props.alertWithType('error', 'Error', 'Choose a pickup location.');
      return;
    }
    shuffle(this.props.event.rides);
    this.props.event.rides.some(ride => {
      if (ride.passengers === undefined || ride.passengers.length < ride.passengerLimit) {
        this.setState(() => {
          return {
            loading: true,
          };
        });
        global.firebaseApp.database().ref('schools')
          .child(this.props.event.schoolUID)
          .child('events')
          .child(this.props.event.uid)
          .child('rides')
          .child(ride.uid)
          .child('passengers')
          .push({
            userUID: global.firebaseApp.auth().currentUser.uid,
            location: this.state.location,
            isPickedUp: false,
          })
          .then(() => {
            Alert.alert(
              null,
              'Thanks for requesting a ride! Make sure to say hello to your driver!',
              [{ text: 'OK' }]
            );
            this.setState(() => {
              return {
                loading: false,
              };
            });
            this.props.navigator.pop();
            this.props.refresh(false);
          })
          .catch(err => {
            this.setState(() => {
              return {
                loading: false,
              };
            });
            this.props.alertWithType('error', 'Error', err.toString());
          });
        return true;
      }
      return false;
    });
  }

  render() {
    return (
      <View style={ styles.container }>
        <Choose>
          <When condition={ this.state.loading }>
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
          <Otherwise>
            <ListView
              enableEmptySections
              style={{ marginTop: 4 }}
              dataSource={ this.ds.cloneWithRows(this.state.pickupLocations) }
              renderRow={ location => this.renderOption(location) }
            />
          </Otherwise>
        </Choose>
        <TouchableOpacity
          onPress={ () => this.requestRide() }
        >
          <ElevatedView
            style={ styles.requestButton }
            elevation={ 4 }
          >
            <Text style={ styles.requestButtonText }>
              REQUEST A RIDE
            </Text>
          </ElevatedView>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  requestButton: {
    height: 64,
    backgroundColor: colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    margin: 16,
  },
  requestButtonText: {
    fontFamily: 'open-sans-bold',
    color: 'white',
    fontSize: 24,
  },
  radioGroupContainer: {},
  radioContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lightGrey,
  },
  outerCircle: {
    height: 24,
    width: 24,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderColor: colors.blue,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    height: 16,
    width: 16,
    backgroundColor: colors.blue,
    borderRadius: 8,
  },
  buttonLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: 16,
    fontFamily: 'open-sans',
    fontSize: 18,
    color: colors.black,
  },
});
