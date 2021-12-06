import { message } from 'antd';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import BlankPageTemplate from "../templates/BlankPage";
import VideoCarousel from '../components/VideoCarousel';
import ControlBar from "../components/ControlBar";
import ParticipantList from "../components/ParticipantList";
import InWaitingRoomList from '../components/InWaitingRoomList';
import Chat from '../components/Chat';
import Loader from '../components/Loader';
import { updateRoomData, clearRoomData, upsertUserToRoom, updateMicCameraMuteStatus, userShareScreen, userStopSharingScreen } from '../store/roomReducer';
import { socketIO } from '../helpers/socketio';
import { getRoomAPI } from '../helpers/api'
import { WebRTC } from '..//helpers/webrtc';
import styles from './Room.module.css';

const Room = props => {
  let webRTC;
  const dispatch = useDispatch();
  const { roomId } = useParams();
  const room = useSelector(state => state.room);
  const user = useSelector(state => state.user);
  const chatVisible = useSelector(state => state.ui.chat.visibility);
  const history = useHistory();
  const [ peerConnections, setPeerConnections ] = useState([]);
  const [ localStream, setLocalStream ] = useState();
  const sharingScreen = useSelector(state => state.room.sharingScreen);
  const [ sharingScreenStream, setSharingScreenStream ] = useState(null);
  const constraints = { mediaStreamConstraints: { audio: true, video: true } };
  const handleStreamUpdate = ({ userId, socketId, stream, type }) => {
    console.log('got notified stream updated:', { userId, socketId, stream, type });
    if(type === 'CAMERA')         { setPeerConnections([...webRTC.peerConnections]) }
    if(type === 'SCREEN_SHARING') { setSharingScreenStream({ userId, socketId, stream }) }
  }
  const handleLocalStreamAvailable = ({ stream, type }) => {
    if(type === 'CAMERA') { setLocalStream({ userId: user.id, socketId: socketIO.socket.id, stream }) }
    if(type === 'SCREEN_SHARING') { setSharingScreenStream({ userId: user.id, socketId: socketIO.socket.id, stream }) }
  }
  const start = async roomData => {
    // dispatch updating room
    const participants = roomData.participants.map(({ room_users, ...participant }) => ({ ...participant, sockets: room_users[0].sockets, admitted: room_users[0].admitted }));
    dispatch(updateRoomData({ room: roomData.room, participants }));
    // turn server credential
    constraints.turnCredential = roomData.credential;
    // new user in waiting room
    socketIO.socket.on('user-to-admit', user => {
      console.log('user-to-admit:', user);
      dispatch(upsertUserToRoom(user));
    });
    // user was admitted to the room
    socketIO.socket.on('user-admitted', (userId) => {
      console.log('user-admitted (id):', userId);
      const upsertData = { id: userId, admitted: true };
      webRTC.participantChanges(upsertData, 'UPDATE');
      dispatch(upsertUserToRoom(upsertData));
      setPeerConnections([...webRTC.peerConnections]);
    });
    // admitted user joined
    socketIO.socket.on('user-joined', (user, socketId) => {
      console.log('user-joined (user, socketId):', user, socketId);
      const { room_users, ...data } = user;
      const joinedUser = ({ ...data, sockets: room_users[0].sockets, admitted: room_users[0].admitted });
      webRTC.participantChanges(joinedUser, 'UPDATE', socketId);
      dispatch(upsertUserToRoom(joinedUser));
      if(joinedUser.admitted) { setPeerConnections([...webRTC.peerConnections]) }
    });
    // admitted user left
    socketIO.socket.on('user-left', (user, socketId) => {
      console.log('user-left (user, socketId):', user, socketId);
      const { room_users, ...data } = user;
      const leftUser = ({ ...data, sockets: room_users[0].sockets, admitted: room_users[0].admitted });
      // set sharing screen state if presenter left the room
      if(webRTC.shareScreenPeerConnection && webRTC.shareScreenPeerConnection.socketId === socketId) {
        dispatch(userStopSharingScreen());
      }
      webRTC.participantChanges(leftUser, 'REMOVE', socketId);
      setPeerConnections([...webRTC.peerConnections]);
      dispatch(upsertUserToRoom(leftUser));
    });
    // mediatrack update (mic/camera mute/unmute)
    socketIO.socket.on('mediastream-track-update', socket => {
      webRTC.updateMediaStreamSettings(socket);
      dispatch(updateMicCameraMuteStatus(socket));
    });
    // start sharing screen
    socketIO.socket.on('start-sharing-screen', ({ userId, socketId }) => {
      // if someone or current user is sharing the screen, do nohting
      if(webRTC.screenSharingStream || webRTC.shareScreenPeerConnection) { return }
      dispatch(userShareScreen({ userId, socketId }));
      if(socketIO.socket.id === socketId) {
        const stopSharingCallback = () => {
          socketIO.socket.emit('stop-sharing-screen');
        }
        webRTC.shareScreen(stopSharingCallback);
      }
    });
    // stop sharing screen
    socketIO.socket.on('stop-sharing-screen', () => {
      dispatch(userStopSharingScreen());
      setSharingScreenStream(null);
      webRTC.stopSharingScreen();
    });
    // connect all participants
    window.webRTC = webRTC = WebRTC.getInstance(constraints);
    // update local state if stream changes
    webRTC.event.on('stream', handleStreamUpdate);
    webRTC.event.on('local-stream', handleLocalStreamAvailable);
    await webRTC.start();
    setPeerConnections([...webRTC.peerConnections])
  }
  // ComponentDidMount
  useEffect(() => {
    socketIO.connect(roomId);
    socketIO.socket.on('connect_error', () => {
      history.push('/');
    });
    socketIO.socket.on('connect', () => {
      const getRoomData = async () => {
        let roomData;
        try { roomData = await getRoomAPI(roomId) }
        catch(error) { message.error(error.message); return; }
        // if not admitted, waiting for admit event
        if(roomData.error) {
          // particular user was admitted, start over again
          socketIO.socket.on('admitted-to-room', getRoomData);
          return;
        }
        // if admitted start
        socketIO.socket.off('admitted-to-room', getRoomData);
        start(roomData);
      }
      getRoomData();
    });
    return () => {
      if(webRTC) {
        webRTC.event.off('stream', handleStreamUpdate);
        webRTC.event.off('local-stream', handleLocalStreamAvailable);
        webRTC.destroy();
      }
      socketIO.disconnect();
      dispatch(clearRoomData());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const webRTC = WebRTC.webRTC;
    console.log('detect store change room.settings (webRTC)', webRTC);
    if(!webRTC) { return }
    const { micDeviceId, cameraDeviceId } = room.settings;
    webRTC.changeMediaStreamTrack({
      mediaStreamConstraints: {
        audio: micDeviceId === 'default' ? true : { deviceId: { exact: micDeviceId } },
        video: cameraDeviceId === 'default' ? true : { deviceId: { exact: cameraDeviceId } }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ room.settings ]);

  return (
    <>
      {(localStream && room.data && room.participants) ?
      <div className={styles.roomContainer}>
        <div className={`${styles.room} ${chatVisible ? styles.chatVisible : ''}`}>
          <VideoCarousel peerConnections={[localStream, ...peerConnections]} sharingScreen={sharingScreen} sharingScreenStream={sharingScreenStream}/>
          <ControlBar/>
          <ParticipantList/>
          <InWaitingRoomList/>
        </div>
        <Chat/>
      </div>
      :
        <Loader text="Please wait while the host's letting you in." />
      }
    </>
  );
}
const RoomWithTemplate = () => <BlankPageTemplate children={<Room/>}/>;
export default RoomWithTemplate;