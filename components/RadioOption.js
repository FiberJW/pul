import React, { PropTypes } from 'react';
import RadioIndicator from '../components/RadioIndicator';
import RadioOptionLabel from '../components/styled/RadioOptionLabel';
import RadioInnerContainer from '../components/styled/RadioInnerContainer';
import RadioOuterContainer from '../components/styled/RadioOuterContainer';

const RadioOption = ({ label, color, onPress, selected }) => (
  <RadioOuterContainer onPress={onPress}>
    <RadioInnerContainer>
      <RadioIndicator color={color} selected={selected} />
      <RadioOptionLabel>{label}</RadioOptionLabel>
    </RadioInnerContainer>
  </RadioOuterContainer>
);

RadioOption.propTypes = {
  label: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
};

export default RadioOption;
