import React, { Component, PropTypes } from "react";
import { View, StyleSheet } from "react-native";
import t from "tcomb-form-native";
import newEventFormStylesheet from "../config/newEventFormStylesheet";

const Form = t.form.Form;

const nameRefined = t.refinement(
  t.String,
  string => string.length > 0 && string.length < 45
);

const Name = t.struct({
  name: nameRefined
});

const NameOptions = {
  fields: {
    name: {
      label: "Event Name",
      underlineColorAndroid: "transparent",
      placeholder: "Insert name here",
      stylesheet: newEventFormStylesheet,
      error: "Name should be an appropriate length."
    }
  }
};

export default class GetEventName extends Component {
  static propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func
  };

  isValid = () => {
    return this.name.validate().isValid();
  };

  componentDidMount() {
    this.name.validate();
  }

  render() {
    return (
      <View style={styles.container}>
        <Form
          {...this.props}
          type={Name}
          ref={r => {
            this.name = r;
          }}
          value={this.props.value}
          onChange={name => {
            this.props.onChange(name);
            this.name.validate();
          }}
          options={NameOptions}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
