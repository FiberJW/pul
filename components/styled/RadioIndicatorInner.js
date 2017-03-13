import styled from 'styled-components/native';
import colors from 'colors';

export default styled.View`
  height: 16;
  width: 16;
  background-color: ${({ color }) => color ? color : colors.blue};
  border-radius: 8;
`;
