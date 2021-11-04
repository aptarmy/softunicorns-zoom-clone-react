import { useRef, useEffect } from 'react';
import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';
import VideoAvatar from './VideoAvatar';
import styles from './VideoStream.module.css';

const VideoStream = props => {
  const video = useRef(null);
  useEffect(() => {
    video.current.srcObject = props.stream;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ props.stream ]);
  return (
    <div className={`${styles.videoStreamContainer} ${props.videoClassName ? styles[props.videoClassName] : ''}`}>
      <span className={styles.nameText}>
        {props.micMuted ? <AudioMutedOutlined className={styles.micIcon} /> : <AudioOutlined className={styles.micIcon} />}
        {props.nameText}
      </span>
      <VideoAvatar className={props.cameraMuted ? '' : styles.hide} imgUrl={props.imgUrl}/>
      <video className={props.cameraMuted ? styles.hide : ''} ref={video} autoPlay />
    </div>
  )
}

export default VideoStream;