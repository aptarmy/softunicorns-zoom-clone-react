import { createSlice } from '@reduxjs/toolkit'

export const uiReducer = createSlice({
  name: 'ui',
  initialState: {
    participantList: {
      visibility: false
    },
    inWaitingRoomList: {
      visibility: false
    }
  },
  reducers: {
    participantListVisibility(state, action) {
      state.participantList.visibility = action.payload;
    },
    inWaitingRoomListVisibility(state, action) {
      state.inWaitingRoomList.visibility = action.payload;
    }
  }
})

// Action creators are generated for each case reducer function
export const { participantListVisibility, inWaitingRoomListVisibility } = uiReducer.actions

export default uiReducer.reducer