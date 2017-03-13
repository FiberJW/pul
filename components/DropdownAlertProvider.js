import React, { PropTypes, Component } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import DropdownAlert from 'react-native-dropdownalert';

export default class DropdownAlertProvider extends Component {
  static propTypes = {
    children: React.PropTypes.any,
  };

  static childContextTypes = {
    alertWithType: PropTypes.func,
    alert: PropTypes.func,
  };

  state = {
    barStyle: 'default',
  };

  getChildContext() {
    return {
      alert: (...args) => this.dropdown.alert(...args),
      alertWithType: (...args) => this.dropdown.alertWithType(...args),
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle={this.state.barStyle} />
        {React.Children.only(this.props.children)}
        <DropdownAlert
          ref={ref => {
            this.dropdown = ref;
          }}
          onClose={() => {
            this.setState(() => ({
              barStyle: 'default',
            }));
          }}
          endDelta={StatusBar.currentHeight}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
