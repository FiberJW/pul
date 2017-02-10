import React, { Component, PropTypes } from 'react';
import {
  View,
  StyleSheet,
  ListView,
  StatusBar,
  Text,
  ActivityIndicator,
} from 'react-native';
import colors from '../config/colors';
import { NavigationStyles } from '@exponent/ex-navigation';
import SchoolOption from '../components/SchoolOption';
import Prompt from 'react-native-prompt';
import connectDropdownAlert from '../utils/connectDropdownAlert';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

@connectDropdownAlert
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
  }

  static propTypes = {
    navigator: PropTypes.object,
    intent: PropTypes.string.isRequired,
    alertWithType: PropTypes.func.isRequired,
  }

  state = {
    loading: true,
    schools: [],
    submittingSchoolRequest: false,
    schoolPromptVisible: false,
  }

  componentWillMount() {
    global.firebaseApp.database()
    .ref('schools')
    .once('value')
    .then((snap) => {
      const schools = Object.keys(snap.val()).map(schoolUID => {
        return {
          ...snap.val()[schoolUID],
          uid: schoolUID,
        };
      });
      this.setState(() => {
        return { loading: false, schools };
      });
    })
    .catch((err) => {
      this.props.alertWithType('error', 'Error', err.toString());
    });
  }

  render() {
    return (
      <View style={ styles.container }>
        <StatusBar barStyle="dark-content" />
        <Choose>
          <When condition={ this.state.loading }>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
            </View>
          </When>
          <Otherwise>
            <ListView
              enableEmptySections
              dataSource={ ds.cloneWithRows(this.state.schools) }
              renderRow={ s => <SchoolOption intent={ this.props.intent } school={ s } /> }
            />
          </Otherwise>
        </Choose>
        <Choose>
          <When condition={ this.props.intent === 'signup' }>
            <Text
              onPress={ () => this.setState(() => {
                return { schoolPromptVisible: true };
              }) }
              style={ styles.notExist }
            >
              School not listed?
            </Text>
            <Prompt
              title="What school do you go to?"
              placeholder="Start typing"
              visible={ this.state.schoolPromptVisible }
              onCancel={ () => this.setState(() => {
                return {
                  schoolPromptVisible: false,
                };
              }) }
              onSubmit={ (school) => {
                if (school.trim().length === 0) {
                  this.setState(() => {
                    return {
                      schoolPromptVisible: false,
                    };
                  });
                  this.props.alertWithType(
                      'error',
                      'Error',
                      'Can\'t suggest a school if it doesn\'t exist 😜'
                    );
                  return;
                }
                if (!this.state.submittingSchoolRequest) {
                  this.setState(() => {
                    return {
                      submittingSchoolRequest: true,
                    };
                  });
                  global.firebaseApp.database()
                  .ref('requestedSchools')
                  .push(school.trim())
                  .then(() => {
                    this.props.alertWithType(
                      'success',
                      'Yay!',
                      'Thanks for your feedback! We will bring PÜL to your school as fast as we can!'
                    );
                    this.setState(() => {
                      return {
                        schoolPromptVisible: false,
                        submittingSchoolRequest: false,
                      };
                    });
                  })
                  .catch(error => {
                    this.setState(() => {
                      return {
                        schoolPromptVisible: false,
                        submittingSchoolRequest: false,
                      };
                    });
                    this.props.alertWithType('error', 'Error', error.toString());
                  });
                }
              } }
            />
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
  notExist: {
    fontFamily: 'open-sans',
    paddingBottom: 16,
    fontSize: 16,
    alignSelf: 'center',
    color: colors.black,
  },
});
