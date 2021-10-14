import { useSelector, useDispatch } from 'react-redux';
import { inWaitingRoomListVisibility, participantListVisibility } from '../store/uiReducer';
import { Row, Col, Menu, Dropdown, Badge } from 'antd';
import { AudioFilled, UpOutlined, VideoCameraFilled, TeamOutlined, ClockCircleOutlined, LogoutOutlined } from '@ant-design/icons';
import styles from './ControlBar.module.css';

const dropdownItems = ['test1', 'test2', 'test3']

const dropdown = items => {
  return (
    <Menu>
      {items.map((item, index) => <Menu.Item key={index}>{item}</Menu.Item>)}
    </Menu>
  )
}

const ControlBar = props => {
  const dispatch = useDispatch();
  const participantListUI = useSelector(state => state.ui.participantList);
  const inWaitingRoomListUI = useSelector(state => state.ui.inWaitingRoomList);
  return (
    <Row className={styles.controlBar}>

      <Col className={styles.col} span={2}>
        <div className={styles.buttonContainer}>
          <div className={styles.button}>
            <AudioFilled className={styles.buttonIcon} />
            <div className={styles.buttonDesc}>Mute</div>
          </div>
          <Dropdown className={styles.button} overlay={dropdown(dropdownItems)} placement="bottomRight">
            <UpOutlined className={styles.buttonMore} />
          </Dropdown>
        </div>
      </Col>

      <Col className={styles.col} span={2}>
        <div className={styles.buttonContainer}>
          <div className={styles.button}>
            <VideoCameraFilled className={styles.buttonIcon} />
            <div className={styles.buttonDesc}>Stop</div>
          </div>
          <Dropdown className={styles.button} overlay={dropdown(dropdownItems)} placement="bottomRight">
            <UpOutlined className={styles.buttonMore} />
          </Dropdown>
        </div>
      </Col>

      <Col className={styles.col} span={2} offset={5}>
        <div className={styles.buttonContainer}>
          <div className={styles.button} onClick={() => dispatch(participantListVisibility(!participantListUI.visibility))}>
          <Badge count={2}><TeamOutlined className={styles.buttonIcon} /></Badge>
            <div className={styles.buttonDesc}>Users</div>
          </div>
          <Dropdown className={styles.button} overlay={dropdown(dropdownItems)} placement="bottomRight">
            <UpOutlined className={styles.buttonMore} />
          </Dropdown>
        </div>
      </Col>

      <Col className={styles.col} span={2}>
        <div className={`${styles.buttonContainer} ${styles.noMoreBtn}`}>
          <div className={styles.button} onClick={() => dispatch(inWaitingRoomListVisibility(!inWaitingRoomListUI.visibility))}>
            <Badge count={5}><ClockCircleOutlined className={styles.buttonIcon} /></Badge>
            <div className={styles.buttonDesc}>Waiting</div>
          </div>
        </div>
      </Col>

      <Col className={styles.col} span={2}>
        <div className={`${styles.buttonContainer} ${styles.noMoreBtn}`}>
          <div className={styles.button}>
            <LogoutOutlined className={styles.buttonIcon} />
            <div className={styles.buttonDesc}>Leave</div>
          </div>
        </div>
      </Col>

    </Row>
  );
}

export default ControlBar;