import { Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import VideoStream from '../components/VideoStream';
import styles from './VideoGrid.module.css';

const Video0Grid = () => <div style={{ height: 'calc(100vh - 70px)' }} />;

const Video1Grid = (props) => {
  const peers = props.peers.map(peer => ({ ...props.participants.find(p => p.id === peer.userId), ...peer }));
  console.log('peers to render:', peers);
  return (
    <Row className={`${styles.row} ${styles.row1}`}>
      <Col span={24} className={styles.col}>
        <VideoStream nameText={`${peers[0].fName} ${peers[0].lName}`} micEnabled={true} stream={peers[0].stream} />
      </Col>
    </Row>
  );
}

const Video2Grid = props => (
  <Row className={`${styles.row} ${styles.row1}`}>
    <Col span={12} className={styles.col}>
    <VideoStream nameText="Pakpoom Tiwakornkit" micEnabled={true} src="https://www.w3schools.com/html/mov_bbb.mp4" />
    </Col>
    <Col span={12} className={styles.col}>
    <VideoStream nameText="Pakpoom Tiwakornkit" micEnabled={true} src="https://www.w3schools.com/html/mov_bbb.mp4" />
    </Col>
  </Row>
)

const Video3Grid = props => (
  <Row className={`${styles.row} ${styles.row2} ${styles.rowPaddingLR}`}>
    <Col span={12} className={styles.col}>
      <VideoStream nameText="Pakpoom Tiwakornkit" micEnabled={true} src="https://www.w3schools.com/html/mov_bbb.mp4" />
    </Col>
    <Col span={12} className={styles.col}>
      <VideoStream nameText="Pakpoom Tiwakornkit" micEnabled={true} src="https://www.w3schools.com/html/mov_bbb.mp4" />
    </Col>
    <Col span={24} className={styles.col}>
      <VideoStream nameText="Pakpoom Tiwakornkit" micEnabled={true} src="https://www.w3schools.com/html/mov_bbb.mp4" videoClassName="nth3" />
    </Col>
  </Row>
)

const Video4Grid = props => (
  <Row className={`${styles.row} ${styles.row2} ${styles.rowPaddingLR}`}>
    <Col span={12} className={styles.col}>
      <VideoStream nameText="Pakpoom Tiwakornkit" micEnabled={true} src="https://www.w3schools.com/html/mov_bbb.mp4" />
    </Col>
    <Col span={12} className={styles.col}>
      <VideoStream nameText="Pakpoom Tiwakornkit" micEnabled={false} src="https://www.w3schools.com/html/mov_bbb.mp4" />
    </Col>
    <Col span={12} className={styles.col}>
      <VideoStream nameText="Pakpoom Tiwakornkit" micEnabled={true} src="https://www.w3schools.com/html/mov_bbb.mp4" />
    </Col>
    <Col span={12} className={styles.col}>
      <VideoStream nameText="Pakpoom Tiwakornkit" micEnabled={true} src="https://www.w3schools.com/html/mov_bbb.mp4" />
    </Col>
  </Row>
)

const VideoGrid = props => {
  const participants = useSelector(state => state.room.participants);
  const peers = props.peerConnections;
  if(peers.length === 0) { return <Video0Grid /> }
  if(peers.length === 1) {
    return <div className={styles.videoGrid}><Video1Grid peers={peers} participants={participants}/></div>
  }
  if(peers.length === 2) {
    return <div className={styles.videoGrid}><Video2Grid peers={peers} participants={participants}/></div>
  }
  if(peers.length === 3) {
    return <div className={styles.videoGrid}><Video3Grid peers={peers} participants={participants}/></div>
  }
  if(peers.length === 4) {
    return <div className={styles.videoGrid}><Video4Grid peers={peers} participants={participants}/></div>
  }
}

export default VideoGrid