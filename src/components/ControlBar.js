import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { socketIO } from '../helpers/socketio';
import { useSelector, useDispatch } from 'react-redux';
import { changeCameraMic, markAllChatMessagesRead } from '../store/roomReducer';
import { inWaitingRoomListVisibility, participantListVisibility, chatVisibility } from '../store/uiReducer';
import { Row, Col, Menu, Dropdown, Badge, Modal, message } from 'antd';
import { AudioFilled, AudioMutedOutlined, ExclamationCircleOutlined, MessageFilled, UpOutlined, VideoCameraFilled, EyeInvisibleOutlined, TeamOutlined, ClockCircleFilled, LogoutOutlined } from '@ant-design/icons';
import styles from './ControlBar.module.css';

const ControlBar = props => {
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector(state => state.user);
  const roomData = useSelector(state => state.room.data);
  const unreadChatMessages = useSelector(state => state.room.chatMessages.filter(message => !message.read));
  const participants = useSelector(state => state.room.participants);
  const participantsAdmitted = participants.filter(item => item.admitted);
  const participantsNotAdmitted = participants.filter(item => !item.admitted);
  const participantListVisible = useSelector(state => state.ui.participantList.visibility);
  const inWaitingRoomListVisible = useSelector(state => state.ui.inWaitingRoomList.visibility);
  const chatVisible = useSelector(state => state.ui.chat.visibility);
  let { micMuted, cameraMuted } = participants.find(participant => participant.id === user.id).sockets.find(socket => socket.socketId === socketIO.socket.id);
  const [ mediaDevices, setMediaDevices ] = useState([]);
  const { confirm } = Modal;

  const dropdown = (items, kind) => {
    const handleClick = (item) => {
      console.log('media input device changes:', item);
      if(kind === 'audioinput') { dispatch(changeCameraMic({ micDeviceId:    item.key })) }
      if(kind === 'videoinput') { dispatch(changeCameraMic({ cameraDeviceId: item.key })) }
    };
    return (
      <Menu onClick={handleClick}>
        {items.filter(item => item.kind === kind).map((item, index) => <Menu.Item key={item.id}>{item.label}</Menu.Item>)}
      </Menu>
    )
  }

  const handleLeaveClick = () => {
    if(roomData.ownerId === user.id) {
      return confirm({
        title: 'Do you want to leave and close the session?',
        icon: <ExclamationCircleOutlined />,
        content: 'If you close the session, other participants will be redirected to the home page',
        onOk() { socketIO.socket.emit('room-close') },
        onCancel() { console.log('Cancel') },
      });
    }
    message.success('You have left the room');
    history.push('/');
  }

  useEffect(() => {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => { // [{deviceId: String, kind: String, label: String, groupId: String}]
          console.log(devices);
          const inputDevices = devices.filter(device => device.kind === 'audioinput' || device.kind === 'videoinput').map(device => ({ id: device.deviceId, label: device.label, kind: device.kind }));
          setMediaDevices(inputDevices);
        })
        .catch(error => console.error(error));
  }, []);

  const handleMuteChanges = type => {
    const socketId = socketIO.socket.id;
    let { micMuted, cameraMuted } = participants.find(participant => participant.id === user.id).sockets.find(socket => socket.socketId === socketId);
    if(type === 'camera') { cameraMuted = !cameraMuted }
    if(type === 'audio')  { micMuted = !micMuted }
    socketIO.socket.emit('mediastream-track-update', { micMuted, cameraMuted });
  }

  const handleChatClick = () => {
    const visibility = !chatVisible;
    dispatch(chatVisibility(visibility));
    if(visibility) { dispatch(markAllChatMessagesRead()) }
  };

  return (
    <Row className={styles.controlBar}>

      <Col className={styles.col} span={2}>
        <div className={styles.buttonContainer}>
          <div className={styles.button} onClick={() => handleMuteChanges('audio')}>
            {micMuted ? <AudioMutedOutlined className={styles.buttonIcon} /> : <AudioFilled className={styles.buttonIcon} />}
            <div className={styles.buttonDesc}>{micMuted ? 'UnMute' : 'Mute'}</div>
          </div>
          <Dropdown className={styles.button} overlay={dropdown(mediaDevices, 'audioinput')} placement="bottomRight">
            <UpOutlined className={styles.buttonMore} />
          </Dropdown>
        </div>
      </Col>

      <Col className={styles.col} span={2}>
        <div className={styles.buttonContainer}>
          <div className={styles.button} onClick={() => handleMuteChanges('camera')}>
            {cameraMuted ? <EyeInvisibleOutlined className={styles.buttonIcon} /> : <VideoCameraFilled className={styles.buttonIcon} />}
            <div className={styles.buttonDesc}>{cameraMuted ? 'Start' : 'Stop'}</div>
          </div>
          <Dropdown className={styles.button} overlay={dropdown(mediaDevices, 'videoinput')} placement="bottomRight">
            <UpOutlined className={styles.buttonMore} />
          </Dropdown>
        </div>
      </Col>

      <Col className={styles.col} span={2} offset={4}>
        <div className={styles.buttonContainer}>
          <div className={styles.button} onClick={() => dispatch(participantListVisibility(!participantListVisible))}>
          <Badge count={participantsAdmitted.length}><TeamOutlined className={styles.buttonIcon} /></Badge>
            <div className={styles.buttonDesc}>Users</div>
          </div>
        </div>
      </Col>

      <Col className={styles.col} span={2}>
        <div className={`${styles.buttonContainer} ${styles.noMoreBtn}`}>
          <div className={styles.button} onClick={() => dispatch(inWaitingRoomListVisibility(!inWaitingRoomListVisible))}>
            <Badge count={participantsNotAdmitted.length}><ClockCircleFilled className={styles.buttonIcon} /></Badge>
            <div className={styles.buttonDesc}>Waiting</div>
          </div>
        </div>
      </Col>

      <Col className={styles.col} span={2}>
        <div className={`${styles.buttonContainer} ${styles.noMoreBtn}`}>
          <div className={styles.button} onClick={handleChatClick}>
            <Badge count={unreadChatMessages.length}><MessageFilled className={styles.buttonIcon} /></Badge>
            <div className={styles.buttonDesc}>Chat</div>
          </div>
        </div>
      </Col>

      <Col className={styles.col} span={2}>
        <div className={`${styles.buttonContainer} ${styles.noMoreBtn}`}>
          <div className={styles.button} onClick={handleLeaveClick}>
            <LogoutOutlined className={styles.buttonIcon} />
            <div className={styles.buttonDesc}>Leave</div>
          </div>
        </div>
      </Col>

    </Row>
  );
}

export default ControlBar;