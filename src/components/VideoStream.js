import { createRef, useEffect } from 'react';
import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';
import styles from './VideoStream.module.css';

const VideoStream = props => {
  const video = createRef();
  const updateVideoSrc = () => {
    console.log('stream', props.stream);
    if(!video.current) { console.log('video ref is null!'); return setTimeout(updateVideoSrc, 1000) }
    video.current.srcObject = props.stream;
    window.stream = props.stream;
  }
  window.updateVideoSrc = updateVideoSrc;
  useEffect(() => {
    updateVideoSrc();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ props.stream ]);
  return (
    <div className={`${styles.videoStreamContainer} ${props.videoClassName ? styles[props.videoClassName] : ''}`}>
      <span className={styles.nameText}>
        {props.micEnabled ? <AudioOutlined className={styles.micIcon} /> : <AudioMutedOutlined className={styles.micIcon} />}
        {props.nameText}
      </span>
      <video ref={video} autoPlay />
    </div>
  )
}

export default VideoStream;