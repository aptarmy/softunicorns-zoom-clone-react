import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { message } from 'antd';
import { updateAuthHeader, loginAPI } from '../helpers/api';

export const login = createAsyncThunk('user/login', token => loginAPI(token));

const emptyUserData = {
  id: null,
  fName: null,
  lName: null,
  token: null,
  email: null,
  imgUrl: null,
};
const getUserData = () => JSON.parse(window.localStorage.getItem('userData')) || { ...emptyUserData };
const setUserData = userData => window.localStorage.setItem('userData', JSON.stringify(userData));
const initialUserData = getUserData();
updateAuthHeader(initialUserData.token);

export const userReducer = createSlice({
  name: 'user',
  initialState: initialUserData,
  reducers: {
    logout(state) {
      state.id = null;
      state.fName = null;
      state.lName = null;
      state.token = null;
      state.email = null;
      state.imgUrl = null;
      message.success('Logged out')
      updateAuthHeader(null);
      setUserData(emptyUserData);
    }
  },
  extraReducers(builder) {
    builder
      .addCase(login.fulfilled, (state, action) => {
        const user = action.payload;
        console.log(user);
        state.id = user.id;
        state.fName = user.fName;
        state.lName = user.lName;
        state.token = user.token;
        state.email = user.email;
        state.imgUrl = user.imgUrl;
        message.success('Logged in');
        updateAuthHeader(user.token);
        setUserData(user);
      })
      .addCase(login.rejected, (state, action) => {
        message.error(`Failed to login${action.payload && action.payload.message ? `: ${action.payload.message}` : ''}`);
        updateAuthHeader(null);
        setUserData(emptyUserData);
      });
  }
})

// Action creators are generated for each case reducer function
export const { logout } = userReducer.actions

export default userReducer.reducer