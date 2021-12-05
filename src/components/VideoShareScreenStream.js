import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { socketIO } from '../helpers/socketio';
import VideoStream from './VideoStream';
import styles from './VideoShareScreenStream.module.css';

const VideoShareScreen = ({ peerConnections, sharingScreen, sharingScreenStream }) => {
  const shareScreenVideo = useRef(null);
  const participants = useSelector(state => state.room.participants);
  const participant = participants.find(p => p.id === sharingScreen.userId);
  let { sockets, ...user } = participant;
  const socket = participant.sockets.find(s => s.socketId === sharingScreen.socketId);
  const { micMuted, cameraMuted } = socket;
  user = { ...user, micMuted, cameraMuted };
  // current socket is sharing the screen
  if(sharingScreen.socketId === socketIO.socket.id) {
    user.stream = peerConnections[0].stream; // index 0 is for current user
  }
  // another socket is sharing the screen
  if(sharingScreen.socketId !== socketIO.socket.id) {
    user.stream = peerConnections.find(p => p.socketId === sharingScreen.socketId).stream;
  }

  useEffect(() => {
    console.log('sharingScreenStream changes: ', sharingScreenStream);
    if(!sharingScreenStream) { return }
    shareScreenVideo.current.srcObject = sharingScreenStream.stream;
  }, [ sharingScreenStream ]);

  return (
    <div className={styles.sharingScreenContainer}>
      <video ref={shareScreenVideo} className={styles.sharingScreen} autoPlay />
      <VideoStream nameText={`${user.fName} ${user.lName}`} micMuted={user.micMuted} cameraMuted={user.cameraMuted} stream={user.stream} imgUrl={user.imgUrl} className={styles.videoStream} />
    </div>
  );
}

export default VideoShareScreen;