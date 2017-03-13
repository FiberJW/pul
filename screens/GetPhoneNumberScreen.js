import React, { Component, PropTypes } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Keyboard,
} from 'react-native';
import colors from 'kolors';
import { NavigationStyles } from '@expo/ex-navigation';
import Router from 'Router';
import connectDropdownAlert from '../utils/connectDropdownAlert';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';

/**
 *  For getting a user's phone number in signup
 */
@connectDropdownAlert
export default class GetPhoneNumberScreen extends Component {
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
    phoneNumber: '',
  };

  pushToNextScreen = () => {
    Keyboard.dismiss();
    setTimeout(
      () => {
        // to make sure the keyboard goes down before autofocus on the next screen
        if (
          this.state.phoneNumber.trim().length < 10 ||
          !/^\d+$/.test(this.state.phoneNumber)
        ) {
          this.props.alertWithType(
            'error',
            'Error',
            'Phone number must be provided.',
          );
          return;
        }

        this.props.navigator.push(
          Router.getRoute('getPassword', {
            school: this.props.school,
            intent: this.props.intent,
            credentials: {
              email: this.props.credentials.email,
              name: this.props.credentials.name,
              phoneNumber: this.state.phoneNumber.trim(),
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
          <Text style={styles.fieldLabel}>Phone Number</Text>
          <TextInput
            autoCorrect={false}
            underlineColorAndroid="transparent"
            keyboardType="phone-pad"
            maxLength={10}
            style={styles.fieldContents}
            onChangeText={phoneNumber => this.setState(() => {
              return {
                phoneNumber: phoneNumber.trim(),
              };
            })}
            value={this.state.phoneNumber}
            placeholder="1234567890"
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
    width: Dimensions.get('window').width * 0.60,
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
