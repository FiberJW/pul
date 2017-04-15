import React, { PropTypes } from "react";
import styled from "styled-components/native";

const ButtonContainer = styled.TouchableOpacity`
  background-color: rgba(0,0,0, 0.3);
  padding-horizontal: 40;
  padding-vertical: 16;
  border-radius: 50;
  align-items: center;
  margin: 32;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-size: 14;
  font-family: open-sans-semibold;
`;

const OnboardingButton = props => (
  <ButtonContainer {...props}>
    <ButtonText>{props.label}</ButtonText>
  </ButtonContainer>
);

OnboardingButton.propTypes = {
  label: PropTypes.string.isRequired
};

export default OnboardingButton;
