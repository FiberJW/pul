import React, { Component, PropTypes } from "react";
import hoistNonReactStatic from "hoist-non-react-statics";

export default function connectDropdownAlert(WrappedComponent) {
  class ConnectedDropdownAlert extends Component {
    render() {
      return (
        <WrappedComponent
          {...this.props}
          alertWithType={this.context.alertWithType}
          alert={this.context.alert}
        />
      );
    }
  }

  ConnectedDropdownAlert.contextTypes = {
    alertWithType: PropTypes.func,
    alert: PropTypes.func
  };

  return hoistNonReactStatic(ConnectedDropdownAlert, WrappedComponent);
}
