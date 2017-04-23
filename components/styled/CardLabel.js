import { Dimensions } from "react-native";
import styled from "styled-components/native";
import colors from "kolors";

export default styled.Text`
  font-family: open-sans-bold;
  font-size: 16;
  color: ${colors.black};
  flex-wrap: wrap;
  max-width: ${Dimensions.get("window").width / 2};
`;
