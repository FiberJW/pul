import React, { Component, PropTypes } from "react";
import { View, StyleSheet } from "react-native";
import moment from "moment";
import t from "tcomb-form-native";
import newEventFormStylesheet from "../config/newEventFormStylesheet";
const Form = t.form.Form;

const Time = t.struct({
  time: t.Date
});

const TimeOptions = {
  fields: {
    time: {
      stylesheet: newEventFormStylesheet,
      config: {
        format: time => moment(time).format("h:mm a")
      },
      mode: "time"
    }
  }
};

export default class GetEventTime extends Component {
  static propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func
  };

  isValid = () => {
    return this.time.validate().isValid();
  };

  componentDidMount() {
    this.time.validate();
  }

  render() {
    return (
      <View style={styles.container}>
        <Form
          {...this.props}
          type={Time}
          ref={r => {
            this.time = r;
          }}
          value={this.props.value}
          onChange={time => {
            this.props.onChange(time);
            this.time.validate();
          }}
          options={TimeOptions}
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
