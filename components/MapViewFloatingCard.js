import React, { PropTypes } from "react";
import styled from "styled-components/native";
import ElevatedView from "fiber-react-native-elevated-view";
import colors from "kolors";

const MapViewFloatingCardText = styled.Text`
  font-family: open-sans;
  font-size: 16;
  color: white;
`;

const MapViewFloatingCardContainer = styled(ElevatedView)`
  background-color: ${colors.black};
  padding-vertical: 8;
  padding-horizontal: 16;
  margin-top: 64;
  border-radius: 4;
  justify-content: center;
  align-items: center;
`;

const MapViewFloatingCard = props => (
  <MapViewFloatingCardContainer
    onPress={props.onPress}
    feedbackEnabled
    activeElevation={1}
    elevation={4}
  >
    <MapViewFloatingCardText>
      {props.label}
    </MapViewFloatingCardText>
  </MapViewFloatingCardContainer>
);

MapViewFloatingCard.propTypes = {
  onPress: PropTypes.func,
  label: PropTypes.string
};

export default MapViewFloatingCard;
