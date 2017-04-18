import React, { Component, PropTypes } from "react";
import {
  Animated,
  View,
  Dimensions,
  StyleSheet,
  StatusBar
} from "react-native";
import Router from "Router";
import { observer, inject } from "mobx-react/native";
import OnboardingTitle from "../components/styled/OnboardingTitle";
import OnboardingDescription from "../components/styled/OnboardingDescription";
import OnboardingPage from "../components/styled/OnboardingPage";
import OnboardingButton from "../components/styled/OnboardingButton";
import OnboardingTextContainer
  from "../components/styled/OnboardingTextContainer";

const PAGE_WIDTH = Dimensions.get("window").width;
const PAGES = [
  {
    title: "Stay in the Loop",
    description: "Post events on PÜL to let your classmates know what's happening on campus!",
    backgroundColor: "#d35400",
    image: "https://i.imgur.com/1qPgPW4.jpg"
  },
  {
    title: "Empty Seats Suck",
    backgroundColor: "#0ACF83",
    description: "Offer your classmates a ride to an event.\nMore friends = more fun!",
    image: "https://i.imgur.com/i0nG2VO.jpg"
  },
  {
    title: "Hitch a Ride",
    backgroundColor: "#0264BC",
    description: "No car? No worries!\nPÜL connects you with friends to help get you where you need to go.",
    image: "https://i.imgur.com/MqvQ755.jpg"
  }
];

@inject("uiStore")
@observer
export default class App extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    uiStore: PropTypes.object.isRequired
  };

  state = {
    scroll: new Animated.Value(0)
  };

  render() {
    const position = Animated.divide(this.state.scroll, PAGE_WIDTH);

    const backgroundColor = position.interpolate({
      inputRange: PAGES.map((_, i) => i),
      outputRange: PAGES.map(p => p.backgroundColor)
    });

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor, opacity: 0.8 }]}
        />
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event([
            { nativeEvent: { contentOffset: { x: this.state.scroll } } }
          ])}
        >
          {PAGES.map((page, i) => (
            <OnboardingPage key={i}>
              <OnboardingTextContainer>
                <OnboardingTitle>{page.title}</OnboardingTitle>
                <OnboardingDescription>
                  {page.description}
                </OnboardingDescription>
              </OnboardingTextContainer>

              <Animated.View
                style={[
                  styles.frame,
                  styles.shadow,
                  {
                    transform: [
                      {
                        translateX: Animated.multiply(
                          Animated.add(position, -i),
                          -200
                        )
                      }
                    ]
                  }
                ]}
              >
                <Animated.Image
                  source={{ uri: page.image }}
                  style={styles.photo}
                />
              </Animated.View>
            </OnboardingPage>
          ))}
        </Animated.ScrollView>

        <OnboardingButton
          onPress={() => {
            this.props.uiStore.completeOnboarding();
            this.props.navigator.push(Router.getRoute("entry"));
          }}
          label="GOT IT!"
        />

        <View pointerEvents="none" style={styles.dotsView}>
          {PAGES.map((page, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, { opacity: Animated.add(position, -i + 1) }]}
            />
          ))}
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: StatusBar.currentHeight
  },
  shadow: {
    elevation: 5,
    shadowColor: "#000000",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: {
      height: 12
    }
  },
  frame: {
    borderRadius: (PAGE_WIDTH - 100) / 2,
    height: PAGE_WIDTH - 100,
    marginBottom: 8,
    width: PAGE_WIDTH - 100
  },
  photo: {
    flex: 1,
    borderRadius: (PAGE_WIDTH - 100) / 2
  },
  dotsView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    position: "absolute",
    zIndex: 999,
    bottom: 4,
    left: 0,
    height: 2,
    width: PAGE_WIDTH
  },
  dot: {
    backgroundColor: "rgba(255, 255, 255, .6)",
    height: 2,
    marginLeft: 1,
    width: Math.round(PAGE_WIDTH / PAGES.length) - 4
  }
});
