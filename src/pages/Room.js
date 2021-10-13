import BlankPageTemplate from "../templates/BlankPage";
import VideoGrid from '../components/VideoGrid';
import ControlBar from "../components/ControlBar";
import styles from './Room.module.css';

const Room = () => (
  <div className={styles.room}>
    <VideoGrid/>
    <ControlBar/>
  </div>
)
const RoomWithTemplate = () => <BlankPageTemplate children={<Room/>}/>;
export default RoomWithTemplate;