import React, { PropTypes } from "react";
import WidgetLabelContainer from "./WidgetLabelContainer";
import WidgetLabelText from "./WidgetLabelText";

const WidgetLabel = ({ label }) => (
  <WidgetLabelContainer>
    <WidgetLabelText>{label}</WidgetLabelText>
  </WidgetLabelContainer>
);

WidgetLabel.propTypes = {
  label: PropTypes.string.isRequired
};

export default WidgetLabel;
