import { createSlice } from '@reduxjs/toolkit'

export const userReducer = createSlice({
  name: 'user',
  initialState: {
    id: null,
    fName: null,
    lName: null,
    token: null,
    email: null,
    imgUrl: null
  },
  reducers: {
    login(state, action) {
      const { profile, token } = action.payload;
      state.id = parseInt(profile.googleId);
      state.fName = profile.givenName;
      state.lName = profile.familyName;
      state.token = token.id_token;
      state.email = profile.email;
      state.imgUrl = profile.imageUrl;
    },
    logout(state) {
      state.id = null;
      state.fName = null;
      state.lName = null;
      state.token = null;
      state.email = null;
      state.imgUrl = null;
    }
  }
})

// Action creators are generated for each case reducer function
export const { login, logout } = userReducer.actions

export default userReducer.reducer