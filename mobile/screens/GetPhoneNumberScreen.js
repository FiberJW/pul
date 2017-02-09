import React, { Component, PropTypes } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Keyboard,
  ScrollView,
  LayoutAnimation,
} from 'react-native';
import colors from '../config/colors';
import {
  NavigationStyles,
} from '@exponent/ex-navigation';
import KeyboardEventListener from 'KeyboardEventListener';
import Router from 'Router';
import connectDropdownAlert from '../utils/connectDropdownAlert';

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
  }

  static propTypes = {
    school: PropTypes.object.isRequired,
    credentials: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    intent: PropTypes.string.isRequired,
    alertWithType: PropTypes.func.isRequired,
  }

  state = {
    phoneNumber: '',
    keyboardHeight: 0,
  }

  componentWillMount() {
    this._unsubscribe = KeyboardEventListener.subscribe(this._onKeyboardVisibilityChange);
  }

  componentWillUnmount() {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }
  _blurFocusedTextInput = () => {
    TextInput.State.blurTextInput(TextInput.State.currentlyFocusedField());
  };

  _isKeyboardOpen = () => {
    return this.state.keyboardHeight > 0;
  }

  _onKeyboardVisibilityChange = (
    { keyboardHeight, layoutAnimationConfig }:
    { keyboardHeight: number, layoutAnimationConfig: ?Object }) => {
    if (keyboardHeight === 0) {
      this._blurFocusedTextInput();
    }

    if (layoutAnimationConfig) {
      LayoutAnimation.configureNext(layoutAnimationConfig);
    }

    this.setState(() => {
      return {
        keyboardHeight,
      };
    });
  }

  pushToNextScreen = () => {
    Keyboard.dismiss();
    setTimeout(() => { // to make sure the keyboard goes down before autofocus on the next screen
      if (this.state.phoneNumber.trim().length < 10 || !(/^\d+$/.test(this.state.phoneNumber))) {
        this.props.alertWithType('error', 'Error', 'Phone number must be provided.');
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
        })
      );
    }, 10);
  }

  render() {
    return (
      <ScrollView
        onScroll={ this._blurFocusedTextInput }
        scrollEventThrottle={ 32 }
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="always"
        contentContainerStyle={ [styles.container,
          this.state.keyboardHeight ?
          { flex: 1, marginBottom: this.state.keyboardHeight } :
          { flex: 1 },
        ] }
      >
        <View />
        <View>
          <Text style={ styles.fieldLabel }>Phone Number</Text>
          <TextInput
            underlineColorAndroid="transparent"
            keyboardType="phone-pad"
            maxLength={ 10 }
            style={ styles.fieldContents }
            onChangeText={ (phoneNumber) => this.setState(() => {
              return {
                phoneNumber: phoneNumber.trim(),
              };
            }) }
            value={ this.state.phoneNumber }
            placeholder="1234567890"
            autoFocus
            blurOnSubmit
            returnKeyType="next"
            onSubmitEditing={ () => this.pushToNextScreen() }
          />
        </View>
        <TouchableOpacity
          onPress={ () => this.pushToNextScreen() }
          style={ styles.touchable }
        >
          <Text style={ styles.touchableText }>Next</Text>
        </TouchableOpacity>
      </ScrollView>
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
