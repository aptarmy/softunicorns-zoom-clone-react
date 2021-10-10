import { Row, Col } from 'antd';
import BlankPageTemplate from "../templates/BlankPage";
import styles from './Room.module.css';

const Video1Grid = props => (
  <Row className={`${styles.row} ${styles.row1}`}>
    <Col span={24} className={styles.col}>
      <video src="https://www.w3schools.com/html/mov_bbb.mp4" width="100%" />
    </Col>
  </Row>
)

const Video2Grid = props => (
  <Row className={`${styles.row} ${styles.row1}`}>
    <Col span={12} className={styles.col}>
      <video>
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>
    </Col>
    <Col span={12} className={styles.col}>
      <video>
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>
    </Col>
  </Row>
)

const Video3Grid = props => (
  <Row className={`${styles.row} ${styles.row2} ${styles.rowPaddingLR}`}>
    <Col span={12} className={styles.col}>
      <video>
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>
    </Col>
    <Col span={12} className={styles.col}>
      <video>
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>
    </Col>
    <Col span={24} className={styles.col}>
      <video className={styles.nth3}>
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>
    </Col>
  </Row>
)

const Video4Grid = props => (
  <Row className={`${styles.row} ${styles.row2} ${styles.rowPaddingLR}`}>
    <Col span={12} className={styles.col}>
      <video>
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>
    </Col>
    <Col span={12} className={styles.col}>
      <video>
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>
    </Col>
    <Col span={12} className={styles.col}>
      <video>
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>
    </Col>
    <Col span={12} className={styles.col}>
      <video>
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>
    </Col>
  </Row>
)

const VideoGrid = props => {
  if(props.peers/*.legnth === 1*/) {
    return <Video1Grid/>;
  }
  if(props.peers/*.length === 2*/) {
    return <Video2Grid/>
  }
  if(props.peers/*.length === 3*/) {
    return <Video3Grid/>
  }
  if(!props.peers/*.length === 4*/) {
    return <Video4Grid/>
  }
}

const Room = () => (
  <div className={styles.room}>
    <VideoGrid/>
  </div>
)
const RoomWithTemplate = () => <BlankPageTemplate children={<Room/>}/>;
export default RoomWithTemplate;