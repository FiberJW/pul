import React, { PropTypes, Component } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import DropdownAlert from "react-native-dropdownalert";
import { observer } from "mobx-react/native";
import { observable, action } from "mobx";

@observer
export default class DropdownAlertProvider extends Component {
  static propTypes = {
    children: React.PropTypes.any
  };

  static childContextTypes = {
    alertWithType: PropTypes.func,
    alert: PropTypes.func
  };

  @observable barStyle = "default";
  @action resetBarStyle = () => {
    this.barStyle = "default";
  };

  getChildContext() {
    return {
      alert: (...args) => this.dropdown.alert(...args),
      alertWithType: (...args) => this.dropdown.alertWithType(...args)
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle={this.barStyle} />
        {React.Children.only(this.props.children)}
        <DropdownAlert
          ref={ref => {
            this.dropdown = ref;
          }}
          onClose={this.resetBarStyle}
          endDelta={StatusBar.currentHeight}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
