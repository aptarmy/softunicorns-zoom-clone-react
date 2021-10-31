import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../store/userReducer';
import uiReducer from '../store/uiReducer';
import redirectReducer from './redirectReducer';
import roomReducer from './roomReducer';

const store = configureStore({
  reducer: {
    user: userReducer,
    ui: uiReducer,
    redirect: redirectReducer,
    room: roomReducer
  }
});
// debugging
window.store = store;
export default store;