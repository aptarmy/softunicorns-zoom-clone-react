import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../store/userReducer';
import uiReducer from '../store/uiReducer';

export default configureStore({
  reducer: {
    user: userReducer,
    ui: uiReducer
  }
});