import React, { PropTypes } from "react";
import hoistNonReactStatic from "hoist-non-react-statics";

export default function connectDropdownAlert(WrappedComponent) {
  const ConnectedDropdownAlert = (props, context) => {
    return (
      <WrappedComponent
        {...props}
        alertWithType={context.alertWithType}
        alert={context.alert}
      />
    );
  };

  ConnectedDropdownAlert.contextTypes = {
    alertWithType: PropTypes.func,
    alert: PropTypes.func
  };

  return hoistNonReactStatic(ConnectedDropdownAlert, WrappedComponent);
}
