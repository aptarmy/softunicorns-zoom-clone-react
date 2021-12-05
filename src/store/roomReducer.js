import { createSlice } from '@reduxjs/toolkit'

export const roomReducer = createSlice({
  name: 'room',
  initialState: {
    data: null, // { ownerId: Integer, slug: String }
    participants: null, // [ { id: Integer, fName: String, lName: String, email: String, sockets: [{socketId: String, micMuted: Boolean, cameraMuted: Boolean}], admitted: Boolean } ]
    chatMessages: [], // [{ userId: Integer, message: String, timestamp: Integer, read: Boolean }]
    sharingScreen: null, // { userId: Integer, socketId: String }
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
      state.chatMessages = [];
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
    },
    addChatMessage(state, { payload: { userId, message, timestamp, read } }) {
      state.chatMessages.push({ userId, message, timestamp, read });
    },
    markAllChatMessagesRead(state) {
      const unreadMessages = state.chatMessages.filter(message => !message.read);
      unreadMessages.forEach(message => message.read = true);
    },
    userShareScreen(state, { payload: { userId, socketId } }) {
      state.sharingScreen = { userId, socketId }
    },
    userStopSharingScreen(state) {
      state.sharingScreen = null;
    }
  }
})

// Action creators are generated for each case reducer function
export const { updateRoomData, clearRoomData, upsertUserToRoom, updateMicCameraMuteStatus, changeCameraMic, addChatMessage, markAllChatMessagesRead, userShareScreen, userStopSharingScreen } = roomReducer.actions

export default roomReducer.reducer