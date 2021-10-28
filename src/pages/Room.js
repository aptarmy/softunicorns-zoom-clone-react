import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BlankPageTemplate from "../templates/BlankPage";
import VideoGrid from '../components/VideoGrid';
import ControlBar from "../components/ControlBar";
import ParticipantList from "../components/ParticipantList";
import InWaitingRoomList from '../components/InWaitingRoomList';
import { socketIO } from '../helpers/socketio';
import styles from './Room.module.css';

const Room = props => {
  const { roomId } = useParams();
  useEffect(() => {
    socketIO.connect(roomId);
    return () => {
      socketIO.disconnect();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={styles.room}>
      <VideoGrid/>
      <ControlBar/>
      <ParticipantList/>
      <InWaitingRoomList/>
    </div>
  );
}
const RoomWithTemplate = () => <BlankPageTemplate children={<Room/>}/>;
export default RoomWithTemplate;