import React from 'react';
import RadioIndicatorOuter from './styled/RadioIndicatorOuter';
import RadioIndicatorInner from './styled/RadioIndicatorInner';

export default ({ color, selected }) => (
  <RadioIndicatorOuter color={color}>
    {selected && <RadioIndicatorInner color={color} />}
  </RadioIndicatorOuter>
);
