import React, { Component, PropTypes } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import colors from '../config/colors';
import { NavigationStyles } from '@expo/ex-navigation';
import Router from 'Router';
import connectDropdownAlert from '../utils/connectDropdownAlert';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';

/**
 *  For getting a user's name in signup
 */
@connectDropdownAlert
export default class GetNameScreen extends Component {
  static route = {
    navigationBar: {
      visible: true,
      tintColor: colors.black,
      borderBottomColor: 'transparent',
      backgroundColor: 'white',
    },
    styles: {
      ...NavigationStyles.SlideHorizontal,
    },
  };

  static propTypes = {
    school: PropTypes.object.isRequired,
    credentials: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    intent: PropTypes.string.isRequired,
    alertWithType: PropTypes.func.isRequired,
  };

  state = {
    name: '',
  };

  pushToNextScreen = () => {
    Keyboard.dismiss();
    setTimeout(
      () => {
        // to make sure the keyboard goes down before autofocus on the next screen
        if (!this.state.name.trim().length) {
          this.props.alertWithType('error', 'Error', 'Name must be provided.');
          return;
        }
        this.props.navigator.push(
          Router.getRoute('getPhoneNumber', {
            school: this.props.school,
            intent: this.props.intent,
            credentials: {
              email: this.props.credentials.email,
              name: this.state.name.trim(),
            },
          }),
        );
      },
      10,
    );
  };

  render() {
    return (
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <View />
        <View>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            autoCorrect={false}
            underlineColorAndroid="transparent"
            style={styles.fieldContents}
            onChangeText={name => this.setState(() => ({ name }))}
            value={this.state.name}
            placeholder="John Doe"
            autoFocus
            blurOnSubmit
            returnKeyType="next"
            onSubmitEditing={() => this.pushToNextScreen()}
          />
        </View>
        <TouchableOpacity
          onPress={() => this.pushToNextScreen()}
          style={styles.touchable}>
          <Text style={styles.touchableText}>Next</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  fieldLabel: {
    marginBottom: 8,
    fontFamily: 'open-sans-semibold',
    fontSize: 20,
    color: colors.black,
  },
  fieldContents: {
    fontFamily: 'open-sans',
    height: 40,
    color: colors.black,
    fontSize: 18,
  },
  assistedTextInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputAssist: {
    fontFamily: 'open-sans',
    fontSize: 18,
    color: colors.black,
  },
  touchable: {
    alignSelf: 'flex-end',
  },
  touchableText: {
    fontFamily: 'open-sans-semibold',
    fontSize: 24,
    color: colors.black,
  },
});
