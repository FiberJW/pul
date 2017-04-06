import { action } from 'mobx';
import { create } from 'mobx-persist';
import { AsyncStorage } from 'react-native';

class UIStore {
  constructor() {
    this.hydrate();
  }

  @action hydrate = () => {
    const pour = create({
      storage: AsyncStorage,
    });

    Object.keys(this).forEach(key => {
      pour(key, this);
    });
  };
}

export default new UIStore();
