import { createSlice } from '@reduxjs/toolkit'

export const roomReducer = createSlice({
  name: 'room',
  initialState: {
    data: null, // { ownerId: Integer, slug: String }
    participants: null, // [ { id: Integer, fName: String, lName: String, email: String, sockets: [{socketId: String, micMuted: Boolean, cameraMuted: Boolean}], admitted: Boolean } ]
    settings: { micDeviceId: 'default', cameraDeviceId: 'default' }
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
      state.participants.push({ ...payload, admitted: false });
    },
    updateMicCameraMuteStatus(state, { payload }) {
      const { userId, socketId, micMuted, cameraMuted } = payload;
      const participantIndex = state.participants.findIndex(participant => participant.id === userId);
      const socketIndex = state.participants[participantIndex].sockets.findIndex(socket => socket.socketId === socketId);
      state.participants[participantIndex].sockets[socketIndex] = { ...state.participants[participantIndex].sockets[socketIndex], micMuted, cameraMuted };
    },
    changeCameraMic(state, { payload }) {
      const { micDeviceId, cameraDeviceId } = payload;
      if(micDeviceId) { state.settings.micDeviceId = micDeviceId }
      if(cameraDeviceId) { state.settings.cameraDeviceId = cameraDeviceId }
    }
  }
})

// Action creators are generated for each case reducer function
export const { updateRoomData, clearRoomData, upsertUserToRoom, updateMicCameraMuteStatus, changeCameraMic } = roomReducer.actions

export default roomReducer.reducer