import React, { Component, PropTypes } from "react";
import { View, StyleSheet } from "react-native";
import t from "tcomb-form-native";
import newEventFormStylesheet from "../config/newEventFormStylesheet";

const Form = t.form.Form;

const descriptionRefined = t.refinement(
  t.String,
  string => string.length > 0 && string.length <= 140
);

const Description = t.struct({
  description: t.maybe(descriptionRefined)
});

const DescriptionOptions = {
  fields: {
    description: {
      maxLength: 140,
      underlineColorAndroid: "transparent",
      label: "Event Description",
      placeholder: "Describe Event here (optional)",
      stylesheet: newEventFormStylesheet,
      error: "Description should be an appropriate length."
    }
  }
};

export default class GetEventName extends Component {
  static propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func
  };

  isValid = () => {
    return this.description.validate().isValid();
  };

  componentDidMount() {
    this.description.validate();
  }

  render() {
    return (
      <View style={styles.container}>
        <Form
          {...this.props}
          type={Description}
          ref={r => {
            this.description = r;
          }}
          value={this.props.value}
          onChange={description => {
            this.props.onChange(description);
            this.description.validate();
          }}
          options={DescriptionOptions}
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
