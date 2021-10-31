import { createSlice } from '@reduxjs/toolkit'

export const roomReducer = createSlice({
  name: 'room',
  initialState: {
    data: null, // { ownerId: Integer, slug: String }
    participants: null // [ { id: Integer, fName: String, lName: String, email: String, sockets: Array<String>, admitted: Boolean, micTurnedOn: Boolean, cameraTurnedOn: Boolean } ]
  },
  reducers: {
    updateRoomData(state, { payload: { room, participants } }) {
      state.data = room;
      state.participants = participants;
    },
    clearRoomData(state) {
      state.data = null;
      state.participants = null;
    },
    upsertUserToRoom(state, { payload }) {
      // prevent duplicate user
      const existingUserIndex = state.participants.findIndex(participant => participant.id === payload.id);
      if(existingUserIndex !== -1) {
        state.participants[existingUserIndex] = { ...state.participants[existingUserIndex], ...payload }
        return;
      }
      // update state
      state.participants.push({ ...payload, admitted: false, micTurnedOn: false, cameraTurnedOn: false });
    }
  }
})

// Action creators are generated for each case reducer function
export const { updateRoomData, clearRoomData, upsertUserToRoom } = roomReducer.actions

export default roomReducer.reducer