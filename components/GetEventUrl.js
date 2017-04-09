import React, { Component, PropTypes } from "react";
import { View, StyleSheet } from "react-native";
import t from "tcomb-form-native";
import newEventFormStylesheet from "../config/newEventFormStylesheet";
import validator from "validator";

const Form = t.form.Form;

const Website = t.refinement(t.String, s => validator.isURL(s.toLowerCase()));

const Url = t.struct({
  url: t.maybe(Website)
});

const UrlOptions = {
  fields: {
    url: {
      label: "Event Website",
      underlineColorAndroid: "transparent",
      placeholder: "Insert URL here (optional)",
      stylesheet: newEventFormStylesheet
    }
  }
};

export default class GetEventUrl extends Component {
  static propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func
  };

  isValid = () => {
    return this.url.validate().isValid();
  };

  componentDidMount() {
    this.url.validate();
  }

  render() {
    return (
      <View style={styles.container}>
        <Form
          {...this.props}
          type={Url}
          ref={r => {
            this.url = r;
          }}
          value={this.props.value}
          onChange={url => {
            this.props.onChange(url);
            this.url.validate();
          }}
          options={UrlOptions}
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
