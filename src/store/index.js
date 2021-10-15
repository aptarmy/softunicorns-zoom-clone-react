import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../store/userReducer';
import uiReducer from '../store/uiReducer';
import redirectReducer from './redirectReducer';

const store = configureStore({
  reducer: {
    user: userReducer,
    ui: uiReducer,
    redirect: redirectReducer
  }
});
// debugging
window.store = store;
export default store;