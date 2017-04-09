import React, { PropTypes } from "react";
import RadioIndicatorOuter from "./RadioIndicatorOuter";
import RadioIndicatorInner from "./RadioIndicatorInner";

const RadioIndicator = ({ color, selected }) => (
  <RadioIndicatorOuter color={color}>
    {selected && <RadioIndicatorInner color={color} />}
  </RadioIndicatorOuter>
);

RadioIndicator.propTypes = {
  color: PropTypes.string,
  selected: PropTypes.bool.isRequired
};

export default RadioIndicator;
