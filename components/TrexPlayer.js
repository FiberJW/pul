import React, { PropTypes } from "react";
import { StyleSheet } from "react-native";
import ElevatedView from "fiber-react-native-elevated-view";
import CardSublabel from "./styled/CardSublabel";
import CardLabel from "./styled/CardLabel";
import CardHeader from "./styled/CardHeader";

const TrexPlayer = props => (
  <ElevatedView style={styles.cardContainer} elevation={2}>
    <CardHeader>
      <CardLabel>
        {`#${props.place}`}
      </CardLabel>
      <CardLabel>
        {props.player.displayName.toUpperCase()}
      </CardLabel>
      <CardSublabel>
        {props.player.trexHighestScore}
      </CardSublabel>
    </CardHeader>
  </ElevatedView>
);

TrexPlayer.propTypes = {
  player: PropTypes.object.isRequired,
  place: PropTypes.number.isRequired
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: "white"
  }
});

export default TrexPlayer;
