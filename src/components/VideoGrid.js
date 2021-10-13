import { Row, Col } from 'antd';
import VideoStream from '../components/VideoStream';
import styles from './VideoGrid.module.css';

const Video1Grid = props => (
  <Row className={`${styles.row} ${styles.row1}`}>
    <Col span={24} className={styles.col}>
      <VideoStream nameText="Pakpoom Tiwakornkit" micEnabled={true} src="https://www.w3schools.com/html/mov_bbb.mp4" />
    </Col>
  </Row>
)

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
  if(props.peers/*.legnth === 1*/) {
    return <div className={styles.videoGrid}><Video1Grid/></div>
  }
  if(props.peers/*.length === 2*/) {
    return <div className={styles.videoGrid}><Video2Grid/></div>
  }
  if(props.peers/*.length === 3*/) {
    return <div className={styles.videoGrid}><Video3Grid/></div>
  }
  if(!props.peers/*.length === 4*/) {
    return <div className={styles.videoGrid}><Video4Grid/></div>
  }
}

export default VideoGrid