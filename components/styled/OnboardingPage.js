import styled from "styled-components/native";
import { Dimensions } from "react-native";

export default styled.View`
  width: ${Dimensions.get("window").width};
  justify-content: space-around;
  align-items: center;
`;
