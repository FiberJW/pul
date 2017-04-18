import { action, observable } from "mobx";
import { create, persist } from "mobx-persist";
import { AsyncStorage } from "react-native";

class UIStore {
  constructor() {
    this.hydrate();
  }

  @persist
  @observable
  onboardingCompleted = false;

  @action completeOnboarding = () => {
    this.onboardingCompleted = true;
  };

  @action hydrate = () => {
    const pour = create({
      storage: AsyncStorage
    });

    Object.keys(this).forEach(key => {
      pour(key, this);
    });
  };
}

export default new UIStore();
