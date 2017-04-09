import React, { Component, PropTypes } from "react";
import { View, StyleSheet } from "react-native";
import t from "tcomb-form-native";
import newEventFormStylesheet from "../config/newEventFormStylesheet";

const Form = t.form.Form;

const types = t.enums({
  sports: "Sports",
  party: "Party",
  arts: "Fine Arts",
  festival: "Festival",
  hackathon: "Hackathon",
  music: "Music",
  tech: "Tech",
  film: "Film",
  beliefs: "Beliefs",
  social: "Social",
  club: "Club",
  learning: "Learning",
  food: "Food",
  culture: "Culture",
  dance: "Dance"
});

const Type = t.struct({
  type: types
});
const TypeOptions = {
  fields: {
    type: {
      mode: "dropdown",
      nullOption: { value: null, text: "Choose a type" },
      label: "Event Type",
      stylesheet: newEventFormStylesheet
    }
  }
};

export default class GetEventType extends Component {
  static propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func
  };

  isValid = () => {
    return this.type.validate().isValid();
  };

  componentDidMount() {
    this.type.validate();
  }

  render() {
    return (
      <View style={styles.container}>
        <Form
          {...this.props}
          type={Type}
          ref={r => {
            this.type = r;
          }}
          value={this.props.value}
          onChange={type => {
            this.props.onChange(type);
            this.type.validate();
          }}
          options={TypeOptions}
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
