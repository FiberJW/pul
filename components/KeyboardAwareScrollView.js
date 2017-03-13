import React, { Component, PropTypes } from 'react';
import { TextInput, ScrollView, LayoutAnimation } from 'react-native';
import KeyboardEventListener from 'KeyboardEventListener';

export default class KeyboardAwareScrollView extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
    contentContainerStyle: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array,
      PropTypes.number,
    ]),
  };

  static defaultProps = {
    children: [],
    contentContainerStyle: {},
  };

  state = {
    keyboardHeight: 0,
  };

  componentWillMount() {
    this._unsubscribe = KeyboardEventListener.subscribe(
      this._onKeyboardVisibilityChange
    );
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
  };

  _onKeyboardVisibilityChange = (
    {
      keyboardHeight,
      layoutAnimationConfig,
    }: { keyboardHeight: number, layoutAnimationConfig: ?Object }
  ) => {
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
  };

  render() {
    return (
      <ScrollView
        onScroll={this._blurFocusedTextInput}
        scrollEventThrottle={32}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="always"
        contentContainerStyle={[
          this.props.contentContainerStyle,
          this.state.keyboardHeight
            ? { flex: 1, marginBottom: this.state.keyboardHeight }
            : { flex: 1 },
        ]}
      >
        {this.props.children}
      </ScrollView>
    );
  }
}
