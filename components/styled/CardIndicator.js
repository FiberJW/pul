import styled from "styled-components/native";
import colors from "kolors";

export default styled.View`
  position: absolute;
  top: 8;
  right: 0;
  width: 4;
  height: 24;
  background-color: ${({ active }) => active ? colors.neonGreen : colors.amber};
  border-top-left-radius: 4;
  border-bottom-left-radius: 4;
`;
