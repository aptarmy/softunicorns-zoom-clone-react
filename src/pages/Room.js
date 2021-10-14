import BlankPageTemplate from "../templates/BlankPage";
import VideoGrid from '../components/VideoGrid';
import ControlBar from "../components/ControlBar";
import ParticipantList from "../components/ParticipantList";
import InWaitingRoomList from '../components/InWaitingRoomList';
import styles from './Room.module.css';

const Room = () => (
  <div className={styles.room}>
    <VideoGrid/>
    <ControlBar/>
    <ParticipantList/>
    <InWaitingRoomList/>
  </div>
)
const RoomWithTemplate = () => <BlankPageTemplate children={<Room/>}/>;
export default RoomWithTemplate;