import t from "tcomb-form-native";
import _ from "lodash";
import colors from "kolors";

const defaultStylesheet = _.cloneDeep(t.form.Form.stylesheet);

const pickupTimeStylesheet = {
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
  dateValue: {
    ...defaultStylesheet.dateValue,
    normal: {
      ...defaultStylesheet.dateValue.normal,
      fontFamily: "open-sans-semibold",
      fontSize: 48,
      color: colors.black,
      alignSelf: "center",
      padding: 0,
      paddingVertical: 8,
      marginBottom: 0
    },
    error: {
      ...defaultStylesheet.dateValue.error,
      fontFamily: "open-sans-semibold",
      fontSize: 48,
      padding: 0,
      alignSelf: "center",
      marginBottom: 0,
      paddingVertical: 8
    }
  },
  pickerValue: {
    ...defaultStylesheet.pickerValue,
    normal: {
      ...defaultStylesheet.pickerValue.normal,
      fontFamily: "open-sans",
      padding: 0,
      color: colors.black,
      paddingLeft: 0,
      paddingVertical: 8,
      marginBottom: 0
    },
    error: {
      ...defaultStylesheet.pickerValue.error,
      fontFamily: "open-sans",
      padding: 0,
      paddingLeft: 0,
      marginBottom: 0,
      paddingVertical: 8
    }
  },
  dateTouchable: {
    ...defaultStylesheet.dateTouchable,
    normal: {
      ...defaultStylesheet.dateTouchable.normal,
      width: 250,
      padding: 0,
      alignSelf: "center"
    },
    error: {
      ...defaultStylesheet.dateTouchable.error,
      width: 250,
      alignSelf: "center",
      padding: 0
    }
  },
  pickerTouchable: {
    ...defaultStylesheet.pickerTouchable,
    normal: {
      ...defaultStylesheet.pickerTouchable.normal,
      width: 250,
      padding: 0
    },
    error: {
      ...defaultStylesheet.pickerTouchable.error,
      width: 250,
      padding: 0
    }
  },
  select: {
    ...defaultStylesheet.select,
    normal: {
      ...defaultStylesheet.select.normal,
      width: 250,
      marginLeft: -7,
      marginBottom: 0
    },
    error: {
      ...defaultStylesheet.select.error,
      width: 250,
      marginBottom: 0
    }
  }
};

export default pickupTimeStylesheet;
