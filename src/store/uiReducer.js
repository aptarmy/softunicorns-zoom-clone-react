import { createSlice } from '@reduxjs/toolkit'

export const uiReducer = createSlice({
  name: 'ui',
  initialState: {
    participantList: {
      visibility: false
    },
    inWaitingRoomList: {
      visibility: false
    },
    chat: {
      visibility: false
    }
  },
  reducers: {
    participantListVisibility(state, action) {
      state.participantList.visibility = action.payload;
    },
    inWaitingRoomListVisibility(state, action) {
      state.inWaitingRoomList.visibility = action.payload;
    },
    chatVisibility(state, action) {
      state.chat.visibility = action.payload;
    }
  }
})

// Action creators are generated for each case reducer function
export const { participantListVisibility, inWaitingRoomListVisibility, chatVisibility } = uiReducer.actions

export default uiReducer.reducer