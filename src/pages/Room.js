import { message } from 'antd';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import BlankPageTemplate from "../templates/BlankPage";
import VideoGrid from '../components/VideoGrid';
import ControlBar from "../components/ControlBar";
import ParticipantList from "../components/ParticipantList";
import InWaitingRoomList from '../components/InWaitingRoomList';
import Loader from '../components/Loader';
import { updateRoomData, clearRoomData, upsertUserToRoom } from '../store/roomReducer';
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
  // const user = useSelector(state => state.user);
  const history = useHistory();
  const [ peerConnections, setPeerConnections ] = useState([]);
  const handleStreamUpdate = ({ socketId }) => {
    console.log('got notified stream updated');
    setPeerConnections([...webRTC.peerConnections]);
  }
  const start = roomData => {
    // dispatch updating room
    const participants = roomData.participants.map(({ room_users, ...participant }) => ({ ...participant, sockets: room_users[0].sockets.map(s => s.socketId), admitted: room_users[0].admitted, micTurnedOn: false, cameraTurnedOn: false }));
    dispatch(updateRoomData({ room: roomData.room, participants }));
    // new user in waiting room
    socketIO.socket.on('user-to-admit', user => {
      console.log('new user in waiting room:', user);
      dispatch(upsertUserToRoom(user));
    });
    // user was admitted to the room
    socketIO.socket.on('user-admitted', (userId) => {
      console.log('user was admitted to the room (id):', userId);
      const upsertData = { id: userId, admitted: true };
      webRTC.participantChanges(upsertData, 'UPDATE');
      dispatch(upsertUserToRoom(upsertData));
      setPeerConnections([...webRTC.peerConnections]);
    });
    // admitted user joined
    socketIO.socket.on('user-joined', (user, socketId) => {
      const { room_users, ...data } = user;
      const joinedUser = ({ ...data, sockets: room_users[0].sockets.map(s => s.socketId), admitted: room_users[0].admitted, micTurnedOn: false, cameraTurnedOn: false });
      webRTC.participantChanges(joinedUser, 'UPDATE', socketId);
      dispatch(upsertUserToRoom(joinedUser));
      if(joinedUser.admitted) { setPeerConnections([...webRTC.peerConnections]) }
    });
    // admitted user left
    socketIO.socket.on('user-left', (user, socketId) => {
      const { room_users, ...data } = user;
      const leftUser = ({ ...data, sockets: room_users[0].sockets.map(s => s.socketId), admitted: room_users[0].admitted, micTurnedOn: false, cameraTurnedOn: false });
      webRTC.participantChanges(leftUser, 'REMOVE', socketId);
      dispatch(upsertUserToRoom(leftUser));
      setPeerConnections([...webRTC.peerConnections]);
    });
    // user open/close mic/camera
    socketIO.socket.on('user-track-updated', userId => {
      // get track receiver status
      console.log('user\'s track updated (userId):', userId);
    });
    // user sockets change: connect, reconnect, close
    socketIO.socket.on('user-socket-updated', user => {
      console.log('user sockets change:', user);
      const sockets = user.room_users[0].sockets.map(s => s.socketId);
      dispatch(upsertUserToRoom({ id: user.id, sockets }));
    });
    // connect all participants
    window.webRTC = webRTC = new WebRTC({ currentUserId: user.id, participants, mediaStreamConstrains: { audio: true, video: true } });
    // update local state if stream changes
    webRTC.event.on('stream', handleStreamUpdate);
    webRTC.start();
    setPeerConnections([...webRTC.peerConnections]);
  }
  // ComponentDidMount
  useEffect(() => {
    socketIO.connect(roomId);
    socketIO.socket.on('connect', () => {
      const getRoomData = async () => {
        let roomData;
        try { roomData = await getRoomAPI(roomId) }
        catch(error) { message.error(error.message); return; }
        console.log(roomData);
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
    // if the room host left, leave the room
    socketIO.socket.on('host-left', () => {
      message.success('The host has closed the room');
      history.push('/');
    });
    return () => {
      if(webRTC) {
        webRTC.event.on('stream', handleStreamUpdate);
        webRTC.destroy();
      }
      socketIO.disconnect();
      dispatch(clearRoomData());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      {(room.data && room.participants) ?
        <div className={styles.room}>
          <VideoGrid peerConnections={peerConnections}/>
          <ControlBar/>
          <ParticipantList/>
          <InWaitingRoomList/>
        </div>
      :
        <Loader text="Please wait while the host's letting you in." />
      }
    </>
  );
}
const RoomWithTemplate = () => <BlankPageTemplate children={<Room/>}/>;
export default RoomWithTemplate;