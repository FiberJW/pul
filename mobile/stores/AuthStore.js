import { observable, action, computed } from 'mobx';

export default class AuthStore {
  authStates = ['unauthenticated', 'authenticated']
  @observable user = null;
  @observable state = this.authStates[0];
  @observable verified = false;

  @computed get userData() { return this.user; }

  @action signup = () => {}
  @action login = () => {}
  @action logout = () => {}
  @action sendPasswordResetEmail = () => {}
  @action update = () => {}
  @action sendEmailVerification = () => {}
}
