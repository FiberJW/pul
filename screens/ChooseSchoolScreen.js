import React, { Component, PropTypes } from 'react';
import {
  View,
  StyleSheet,
  ListView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import colors from 'kolors';
import { NavigationStyles } from '@expo/ex-navigation';
import SchoolOption from '../components/SchoolOption';
import connectDropdownAlert from '../utils/connectDropdownAlert';
import { email } from 'react-native-communications';
import { observer } from 'mobx-react/native';
import { observable } from 'mobx';
import _ from 'lodash';
import Suggestion from '../components/styled/Suggestion';

@connectDropdownAlert
@observer
export default class ChooseSchoolScreen extends Component {
  static route = {
    navigationBar: {
      visible: true,
      title: 'CHOOSE YOUR SCHOOL',
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
    navigator: PropTypes.object,
    intent: PropTypes.string.isRequired,
    alertWithType: PropTypes.func.isRequired,
  };

  @observable loading = true;
  @observable schools = [];

  ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

  componentWillMount() {
    global.firebaseApp
      .database()
      .ref('schools')
      .once('value')
      .then(schoolsSnap => {
        this.schools = _.map(schoolsSnap.val(), (school, uid) => {
          return {
            ...school,
            uid,
          };
        });
        this.loading = false;
      })
      .catch(err => {
        this.props.alertWithType('error', 'Error', err.toString());
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Choose>
          <When condition={this.loading}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="large" />
            </View>
          </When>
          <Otherwise>
            <ListView
              enableEmptySections
              dataSource={this.ds.cloneWithRows(this.schools.slice())}
              renderRow={s => (
                <SchoolOption intent={this.props.intent} school={s} />
              )}
            />
          </Otherwise>
        </Choose>
        <Choose>
          <When condition={this.props.intent === 'signup'}>
            <TouchableOpacity
              onPress={() => {
                email(
                  ['datwheat@gmail.com'],
                  null,
                  null,
                  'PÜL School Request',
                  `Hey!

You should consider adding <SCHOOL NAME> to PÜL!

Our email domain is <EMAIL DOMAIN> (example: '@stpaulsschool.org').

Our hotspots for pickups are:
  1. Name: <NAME>
      Location: (<LAT>, <LON>)
  2. Name: <NAME>
      Location: (<LAT>, <LON>)
  3. Name: <NAME>
      Location: (<LAT>, <LON>)
  4. Name: <NAME>
      Location: (<LAT>, <LON>)

(How to find coordinates: https://support.google.com/maps/answer/18539)

Thanks a lot for considering adding <SCHOOL NAME> to PÜL!

<SENDER NAME>`
                );
              }}
            >
              <Suggestion>
                School not listed?
              </Suggestion>
            </TouchableOpacity>
          </When>
        </Choose>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
});
