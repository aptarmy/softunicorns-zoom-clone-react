import { createSlice } from '@reduxjs/toolkit'

export const userReducer = createSlice({
  name: 'user',
  initialState: {
    id: 123,
    fName: 'Pakpoom',
    lName: 'Tiwakornkit',
    token: 'abcd123',
    email: 'apt.enjoy@gmail.com',
    isLoggedIn: true,
  },
  reducers: {
    login(state) {
      state.id = 123;
      state.fName = 'Pakpoom';
      state.lName = 'Tiwakornkit';
      state.token = 'abcd123';
      state.email = 'apt.enjoy@gmail.com';
    },
    logout(state) {
      state.id = null;
      state.fName = null;
      state.lName = null;
      state.token = null;
      state.email = null;
    }
  }
})

// Action creators are generated for each case reducer function
export const { login, logout } = userReducer.actions

export default userReducer.reducer