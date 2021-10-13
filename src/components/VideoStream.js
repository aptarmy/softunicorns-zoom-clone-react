import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';
import styles from './VideoStream.module.css';

const VideoStream = props => (
  <div className={`${styles.videoStreamContainer} ${props.videoClassName ? styles[props.videoClassName] : ''}`}>
    <span className={styles.nameText}>
      {props.micEnabled ? <AudioOutlined className={styles.micIcon} /> : <AudioMutedOutlined className={styles.micIcon} />}
      {props.nameText}
    </span>
    <video>
      <source src={props.src} type="video/mp4" />
    </video>
  </div>
)

export default VideoStream;