import React, { Component, PropTypes } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Keyboard,
  LayoutAnimation,
} from 'react-native';
import colors from '../config/colors';
import {
  NavigationStyles,
} from '@exponent/ex-navigation';
import KeyboardEventListener from 'KeyboardEventListener';
import Router from 'Router';
import validator from 'validator';
import connectDropdownAlert from '../utils/connectDropdownAlert';

/**
 *  For getting a user's email in signup or login
 */
@connectDropdownAlert
export default class GetEmailScreen extends Component {
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
    navigator: PropTypes.object.isRequired,
    intent: PropTypes.string.isRequired,
    alertWithType: PropTypes.func.isRequired,
  }

  state = {
    emailUsername: '',
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
      if (!this.state.emailUsername.trim().length) {
        this.props.alertWithType('error', 'Error', 'Email username must be provided.');
        return;
      }
      if (validator.isEmail(this.state.emailUsername.trim())) {
        this.props.alertWithType('error', 'Error', 'Supply your email username only.');
        return;
      }
      const scene = this.props.intent === 'signup' ? 'getName' : 'getPassword';
      this.props.navigator.push(
        Router.getRoute(scene, {
          school: this.props.school,
          intent: this.props.intent,
          credentials: {
            email: this.state.emailUsername.toLowerCase().trim() + this.props.school.emailSuffix,
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
          <Text style={ styles.fieldLabel }>Email</Text>
          <View style={ styles.assistedTextInputContainer }>
            <TextInput
              underlineColorAndroid="transparent"
              style={ styles.fieldContents }
              onChangeText={ (emailUsername) => this.setState(() => {
                return { emailUsername: emailUsername.trim() };
              }) }
              value={ this.state.emailUsername }
              placeholder="Username"
              autoFocus
              blurOnSubmit
              returnKeyType="next"
              onSubmitEditing={ () => this.pushToNextScreen() }
            />
            <Text style={ styles.inputAssist }>{this.props.school.emailSuffix}</Text>
          </View>
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
    color: colors.black,
    fontSize: 18,
  },
  assistedTextInputContainer: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
  },
  inputAssist: {
    fontFamily: 'open-sans',
    fontSize: 16,
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
