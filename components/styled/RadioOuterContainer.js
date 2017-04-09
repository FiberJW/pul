import { StyleSheet } from "react-native";
import styled from "styled-components/native";
import colors from "kolors";

export default styled.TouchableOpacity`
  padding: 16;
  flex-direction: row;
  background-color: white;
  borderBottom-width: ${StyleSheet.hairlineWidth};
  border-color: ${colors.lightGrey};
`;
