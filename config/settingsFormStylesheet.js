import t from "tcomb-form-native";
import _ from "lodash";
import colors from "kolors";

const defaultStylesheet = _.cloneDeep(t.form.Form.stylesheet);

const settingsFormStylesheet = {
  ...defaultStylesheet,
  errorBlock: {
    ...defaultStylesheet.errorBlock,
    fontFamily: "open-sans-light",
    fontSize: 12,
    alignSelf: "flex-end"
  },
  formGroup: {
    ...defaultStylesheet.formGroup,
    normal: {
      ...defaultStylesheet.formGroup.normal,
      marginBottom: 0
    },
    error: {
      ...defaultStylesheet.formGroup.error,
      marginBottom: 0
    }
  },
  textbox: {
    ...defaultStylesheet.textbox,
    normal: {
      ...defaultStylesheet.textbox.normal,
      color: colors.black,
      fontFamily: "open-sans",
      padding: 0,
      width: 250,
      marginBottom: 0,
      borderWidth: 0
    },
    error: {
      ...defaultStylesheet.textbox.error,
      fontFamily: "open-sans",
      padding: 0,
      width: 250,
      marginBottom: 0,
      borderWidth: 0
    }
  },
  controlLabel: {
    ...defaultStylesheet.controlLabel,
    normal: {
      ...defaultStylesheet.controlLabel.normal,
      color: colors.black,
      marginBottom: 0,
      fontFamily: "open-sans-semibold"
    },
    error: {
      marginBottom: 0,
      ...defaultStylesheet.controlLabel.error,
      fontFamily: "open-sans-semibold"
    }
  },
  dateValue: {
    ...defaultStylesheet.dateValue,
    normal: {
      ...defaultStylesheet.dateValue.normal,
      fontFamily: "open-sans",
      padding: 0,
      paddingVertical: 8,
      marginBottom: 0
    },
    error: {
      ...defaultStylesheet.dateValue.error,
      fontFamily: "open-sans",
      padding: 0,
      marginBottom: 0,
      paddingVertical: 8
    }
  },
  dateTouchable: {
    ...defaultStylesheet.dateTouchable,
    normal: {
      ...defaultStylesheet.dateTouchable.normal,
      width: 250,
      padding: 0
    },
    error: {
      ...defaultStylesheet.dateTouchable.error,
      width: 250,
      padding: 0,
      paddingVertical: 8
    }
  }
};

export default settingsFormStylesheet;
