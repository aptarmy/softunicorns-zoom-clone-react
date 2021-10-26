import store from '../store';

class Subscriber {
  constructor() {
    this.callbacks = []; // [{ callback, watch }]
    const { user, redirect } = store.getState()
    this.prevUser = user;
    this.currentUser = user;
    this.prevRedirect = redirect;
    this.currentRedirect = redirect;
  }
  register(callback, watch) {
    this.callbacks.push({ callback, watch });
  }
  unregister(callback) {
    const indexToRemove = this.callbacks.findIndex(cb => cb.callback.toString() === callback.toString());
    if(indexToRemove === -1) { return }
    this.callbacks.splice(indexToRemove, 1);
  }
  handleChange() {
    this.prevUser = this.currentUser;
    this.prevRedirect = this.currentRedirect;
    const { user, redirect } = store.getState();
    this.currentUser = user;
    this.currentRedirect = redirect;
    // user logged in
    if((this.prevUser.id !== this.currentUser.id) && this.currentUser.id !== null) {
      const cbToExec = this.callbacks.filter(cb => cb.watch === 'USER_LOGGED_IN')
      cbToExec.forEach(cb => {
        cb.callback();
        this.unregister(cb.callback);
      });
    }
    // user cancel login
    if((this.prevRedirect !== this.currentRedirect) && this.currentRedirect.meta === null && this.currentUser.id === null) {
      const cbToExec = this.callbacks.filter(cb => cb.watch === 'USER_CANCEL_LOGIN')
      cbToExec.forEach(cb => {
        cb.callback();
        this.unregister(cb.callback);
      });
    }
  }
}
export const stateSubscriber = new Subscriber();
store.subscribe(stateSubscriber.handleChange.bind(stateSubscriber));