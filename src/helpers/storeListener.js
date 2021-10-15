import store from '../store';

export const listenUserLogin = callback => {
  let unsubscribe;
  function handleChange() {
    const { user, redirect } = store.getState();
    // user logged in
    if(user.id !== null) {
      unsubscribe();
      callback();
    }
    // user cancel login or move to another page
    if(!redirect.meta) {
      unsubscribe();
    }
  }
  unsubscribe = store.subscribe(handleChange)
}

