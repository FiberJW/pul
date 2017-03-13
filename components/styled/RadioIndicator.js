import React from 'react';
import RadioIndicatorOuter from './RadioIndicatorOuter';
import RadioIndicatorInner from './RadioIndicatorInner';

export default ({ color, selected }) => (
  <RadioIndicatorOuter color={color}>
    {selected && <RadioIndicatorInner color={color} />}
  </RadioIndicatorOuter>
);
