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
import connectDropdownAlert from '../utils/connectDropdownAlert';

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
  }

  static propTypes = {
    school: PropTypes.object.isRequired,
    credentials: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    intent: PropTypes.string.isRequired,
    alertWithType: PropTypes.func.isRequired,
  }

  state = {
    name: '',
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
          <Text style={ styles.fieldLabel }>Name</Text>
          <TextInput
            underlineColorAndroid="transparent"
            style={ styles.fieldContents }
            onChangeText={ (name) => this.setState(() => ({ name })) }
            value={ this.state.name }
            placeholder="John Doe"
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
