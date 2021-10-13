import { Row, Col, Menu, Dropdown } from 'antd';
import { AudioFilled, UpOutlined, VideoCameraFilled, TeamOutlined, PoweroffOutlined } from '@ant-design/icons';
import styles from './ControlBar.module.css';

const dropdownItems = ['test1', 'test2', 'test3']

const dropdown = items => {
  return (
    <Menu>
      {items.map((item, index) => <Menu.Item key={index}>{item}</Menu.Item>)}
    </Menu>
  )
}

const ControlBar = props => (
  <Row className={styles.controlBar}>

    <Col span={2}>
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

    <Col span={2}>
      <div className={styles.buttonContainer}>
        <div className={styles.button}>
          <VideoCameraFilled className={styles.buttonIcon} />
          <div className={styles.buttonDesc}>Stop Video</div>
        </div>
        <Dropdown className={styles.button} overlay={dropdown(dropdownItems)} placement="bottomRight">
          <UpOutlined className={styles.buttonMore} />
        </Dropdown>
      </div>
    </Col>

    <Col span={2} offset={6}>
      <div className={styles.buttonContainer}>
        <div className={styles.button}>
          <TeamOutlined className={styles.buttonIcon} />
          <div className={styles.buttonDesc}>Participants</div>
        </div>
        <Dropdown className={styles.button} overlay={dropdown(dropdownItems)} placement="bottomRight">
          <UpOutlined className={styles.buttonMore} />
        </Dropdown>
      </div>
    </Col>

    <Col span={2}>
      <div className={styles.buttonContainer}>
        <div className={styles.button}>
          <PoweroffOutlined className={styles.buttonIcon} />
          <div className={styles.buttonDesc}>Leave</div>
        </div>
      </div>
    </Col>

  </Row>
);

export default ControlBar;