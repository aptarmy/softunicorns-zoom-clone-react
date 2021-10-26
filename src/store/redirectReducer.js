import { createSlice } from '@reduxjs/toolkit'

// For UI purpose only
export const redirectReducer = createSlice({
  name: 'redirect',
  initialState: {
    meta: null // { to: String, from: String, type: String }
  },
  reducers: {
    setTobeRedirected(state, action) {
      state.meta = action.payload;
    }
  }
})

// Action creators are generated for each case reducer function
export const { setTobeRedirected } = redirectReducer.actions

export default redirectReducer.reducer