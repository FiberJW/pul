import styled from 'styled-components/native';
import colors from 'colors';

export default styled.View`
  height: 24;
  width: 24;
  background-color: transparent;
  border-radius: 12;
  border-color: ${({ color }) => color ? color : colors.blue};
  border-width: 1;
  justify-content: center;
  align-items: center;
`;
