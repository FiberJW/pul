import React from "react";
import styled from "styled-components/native";
import colors from "kolors";
import ElevatedView from "fiber-react-native-elevated-view";

const Outer = styled(ElevatedView)`
  height: 24;
  width: 24;
  justify-content: center;
  align-items: center;
  background-color: ${colors.black};
  border-radius: 12;
`;

const Inner = styled.View`
  background-color: white;
  height: 8;
  width: 8;
  border-radius: 4;
`;

export default () => (
  <Outer elevation={5}>
    <Inner />
  </Outer>
);
