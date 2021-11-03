import { Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import VideoStream from '../components/VideoStream';
import styles from './VideoGrid.module.css';

const Video0Grid = () => <div style={{ height: 'calc(100vh - 70px)' }} />;

const Video1Grid = ({ peers }) => {
  return (
    <Row className={`${styles.row} ${styles.row1}`}>
      <Col span={24} className={styles.col}>
        <VideoStream nameText={`${peers[0].fName} ${peers[0].lName}`} micMuted={peers[0].micMuted} cameraMuted={peers[0].cameraMuted} stream={peers[0].stream} imgUrl={peers[0].imgUrl} />
      </Col>
    </Row>
  );
}

const Video2Grid = ({ peers }) => (
  <Row className={`${styles.row} ${styles.row1}`}>
    {peers.map(peer => (
      <Col key={peer.socketId} span={12} className={styles.col}>
        <VideoStream nameText={`${peer.fName} ${peer.lName}`} micMuted={peer.micMuted} cameraMuted={peer.cameraMuted} stream={peer.stream} imgUrl={peer.imgUrl} />
      </Col>
    ))}
  </Row>
)

const Video3Grid = ({ peers }) => (
  <Row className={`${styles.row} ${styles.row2} ${styles.rowPaddingLR}`}>
    {peers.map(peer => (
      <Col key={peer.socketId} span={12} className={styles.col}>
        <VideoStream nameText={`${peer.fName} ${peer.lName}`} micMuted={peer.micMuted} cameraMuted={peer.cameraMuted} stream={peer.stream} imgUrl={peer.imgUrl} />
      </Col>
    ))}
  </Row>
)

const Video4Grid = ({ peers }) => (
  <Row className={`${styles.row} ${styles.row2} ${styles.rowPaddingLR}`}>
    {peers.map(peer => (
      <Col key={peer.socketId} span={12} className={styles.col}>
        <VideoStream nameText={`${peer.fName} ${peer.lName}`} micMuted={peer.micMuted} cameraMuted={peer.cameraMuted} stream={peer.stream} imgUrl={peer.imgUrl} />
      </Col>
    ))}
  </Row>
)

const VideoGrid = props => {
  const participants = useSelector(state => state.room.participants);
  // peers = [{ id: Integer, fName: String, lName: String, email: String, imgUrl: String, socketId: String, stream: MediaStream, pc: RTCPeerConnection, micMuted: Boolean, cameraMuted: Boolean }]
  const peers = props.peerConnections.map(peer => {
    let participant, socket;
    for(let p of participants) {
      for(let s of p.sockets) {
        if(s.socketId === peer.socketId) {
          participant = p;
          socket = s;
        }
      }
    }
    const { sockets, ...user } = participant;
    const { cameraMuted, micMuted } = socket;
    return { ...user, ...peer, cameraMuted, micMuted };
  });
  if(peers.length === 0) { return <Video0Grid /> }
  if(peers.length === 1) {
    return <div className={styles.videoGrid}><Video1Grid peers={peers}/></div>
  }
  if(peers.length === 2) {
    return <div className={styles.videoGrid}><Video2Grid peers={peers}/></div>
  }
  if(peers.length === 3) {
    return <div className={styles.videoGrid}><Video3Grid peers={peers}/></div>
  }
  if(peers.length === 4) {
    return <div className={styles.videoGrid}><Video4Grid peers={peers}/></div>
  }
}

export default VideoGrid