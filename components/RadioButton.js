import React from 'react';
import RadioButtonOuter from './styled/RadioButtonOuter';
import RadioButtonInner from './styled/RadioButtonInner';

export default ({ color, selected }) => (
  <RadioButtonOuter color={color}>
    {selected && <RadioButtonInner color={color} />}
  </RadioButtonOuter>
);
