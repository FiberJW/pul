import React, { Component, PropTypes } from "react";
import { View, StyleSheet } from "react-native";
import moment from "moment";
import t from "tcomb-form-native";
import newEventFormStylesheet from "../config/newEventFormStylesheet";
const Form = t.form.Form;

const _Date = t.struct({
  date: t.Date
});

const DateOptions = {
  fields: {
    date: {
      mode: "date",
      stylesheet: newEventFormStylesheet,
      minimumDate: moment().toDate(),
      maximumDate: moment().add(4, "years").toDate(),
      config: {
        format: date => moment(date).format("MMMM Do, YYYY")
      }
    }
  }
};

export default class GetEventDate extends Component {
  static propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func
  };

  isValid = () => {
    return this.date.validate().isValid();
  };

  componentDidMount() {
    this.date.validate();
  }

  render() {
    return (
      <View style={styles.container}>
        <Form
          {...this.props}
          type={_Date}
          ref={r => {
            this.date = r;
          }}
          value={this.props.value}
          onChange={date => {
            this.props.onChange(date);
            this.date.validate();
          }}
          options={DateOptions}
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
