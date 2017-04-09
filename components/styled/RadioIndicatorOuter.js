import styled from "styled-components/native";
import colors from "kolors";

export default styled.View`
  height: 24;
  width: 24;
  background-color: transparent;
  border-radius: 12;
  border-color: ${({ color }) => color || colors.blue};
  border-width: 1;
  justify-content: center;
  align-items: center;
`;
