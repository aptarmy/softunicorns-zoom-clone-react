import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { socketIO } from '../helpers/socketio';
import { useSelector, useDispatch } from 'react-redux';
import { changeCameraMic, markAllChatMessagesRead } from '../store/roomReducer';
import { inWaitingRoomListVisibility, participantListVisibility, chatVisibility } from '../store/uiReducer';
import { Row, Col, Menu, Dropdown, Badge, Modal, message } from 'antd';
import { AudioFilled, AudioMutedOutlined, ExclamationCircleOutlined, MessageFilled, UpOutlined, VideoCameraFilled, EyeInvisibleOutlined, TeamOutlined, ClockCircleFilled, CopyOutlined, FundProjectionScreenOutlined, FundViewOutlined, LogoutOutlined, MoreOutlined } from '@ant-design/icons';
import styles from './ControlBar.module.css';

const ControlBar = props => {
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector(state => state.user);
  const roomSlug = useSelector(state => state.room.data.slug);
  const unreadChatMessages = useSelector(state => state.room.chatMessages.filter(message => !message.read));
  const participants = useSelector(state => state.room.participants);
  const participantsAdmitted = participants.filter(item => item.admitted);
  const participantsNotAdmitted = participants.filter(item => !item.admitted);
  const participantListVisible = useSelector(state => state.ui.participantList.visibility);
  const inWaitingRoomListVisible = useSelector(state => state.ui.inWaitingRoomList.visibility);
  const chatVisible = useSelector(state => state.ui.chat.visibility);
  const sharingScreen = useSelector(state => state.room.sharingScreen);
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

  const handleUserClick = () => dispatch(participantListVisibility(!participantListVisible));

  const handleWaitingClick = () => dispatch(inWaitingRoomListVisibility(!inWaitingRoomListVisible));

  const handleLeaveClick = () => {
    confirm({
      title: 'Do you want to leave the session?',
      icon: <ExclamationCircleOutlined />,
      content: 'If you leave the session and no one in the session, this session will be closed.',
      onOk() {
        message.success('You have left the room');
        history.push('/');
      },
      onCancel() { console.log('Cancel') },
    });
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

  const handleCopyRoomIdClick = () => {
    navigator.clipboard.writeText(roomSlug);
    message.success(`Copied room ID: ${roomSlug}`);
  }

  const handleScreenShareClick = () => {
    if(!sharingScreen) { socketIO.socket.emit('start-sharing-screen') }
    if(sharingScreen)  { socketIO.socket.emit('stop-sharing-screen') }
  }

  const moreDropdownItems = () => {
    const items = [
      { key: 'users', value: 'Users' },
      { key: 'waiting', value: 'Users in waiting room' },
      { key: 'chat', value: 'Chat' },
      { key: 'roomId', value: 'Copy Room ID' },
      { key: 'leave', value: 'Leave the room' },
    ];
    const handleClick = item => {
      if(item.key === 'users')        { handleUserClick() }
      if(item.key === 'waiting')      { handleWaitingClick() }
      if(item.key === 'chat')         { handleChatClick() }
      if(item.key === 'roomId')       { handleCopyRoomIdClick() }
      if(item.key === 'screen-share') { handleScreenShareClick() }
      if(item.key === 'leave')        { handleLeaveClick() }
    }
    if(!sharingScreen) {
      items.splice(4, 0, { key: 'screen-share', value: 'Sharing Screen' });
    }
    if(sharingScreen && sharingScreen.socketId === socketIO.socket.id) {
      items.splice(4, 0, { key: 'screen-share', value: 'Stop Share Screen' });
    }
    return (
      <Menu onClick={handleClick}>
        {items.map((item) => <Menu.Item key={item.key}>{item.value}</Menu.Item>)}
      </Menu>
    );
  };

  return (
    <Row className={styles.controlBar}>

      <Col className={styles.col} xs={8} md={2}>
        <div className={styles.buttonContainer}>
          <div className={styles.button} onClick={() => handleMuteChanges('audio')}>
            {micMuted ? <AudioMutedOutlined className={styles.buttonIcon} /> : <AudioFilled className={styles.buttonIcon} />}
            <div className={styles.buttonDesc}>{micMuted ? 'UnMute' : 'Mute'}</div>
          </div>
          <Dropdown className={styles.button} overlay={dropdown(mediaDevices, 'audioinput')} placement="bottomRight" trigger={['click']}>
            <UpOutlined className={styles.buttonMore} />
          </Dropdown>
        </div>
      </Col>

      <Col className={styles.col} xs={8} md={2}>
        <div className={styles.buttonContainer}>
          <div className={styles.button} onClick={() => handleMuteChanges('camera')}>
            {cameraMuted ? <EyeInvisibleOutlined className={styles.buttonIcon} /> : <VideoCameraFilled className={styles.buttonIcon} />}
            <div className={styles.buttonDesc}>{cameraMuted ? 'Start' : 'Stop'}</div>
          </div>
          <Dropdown className={styles.button} overlay={dropdown(mediaDevices, 'videoinput')} placement="bottomRight" trigger={['click']}>
            <UpOutlined className={styles.buttonMore} />
          </Dropdown>
        </div>
      </Col>

      <Col className={`${styles.col} ${styles.hideOnDesktop}`} xs={{span: 8, offset: 0}}>
        <div className={styles.buttonContainer}>
          <Dropdown overlay={moreDropdownItems()} placement="bottomRight" trigger={['click']}>
            <div className={styles.button}>
              <MoreOutlined className={styles.buttonIcon} />
              <div className={styles.buttonDesc}>More</div>
            </div>
          </Dropdown>
        </div>
      </Col>

      <Col className={`${styles.col} ${styles.hideOnMobile}`} span={2} offset={2}>
        <div className={styles.buttonContainer}>
          <div className={styles.button} onClick={handleUserClick}>
          <Badge count={participantsAdmitted.length}><TeamOutlined className={styles.buttonIcon} /></Badge>
            <div className={styles.buttonDesc}>Users</div>
          </div>
        </div>
      </Col>

      <Col className={`${styles.col} ${styles.hideOnMobile}`} span={2}>
        <div className={`${styles.buttonContainer} ${styles.noMoreBtn}`}>
          <div className={styles.button} onClick={handleWaitingClick}>
            <Badge count={participantsNotAdmitted.length}><ClockCircleFilled className={styles.buttonIcon} /></Badge>
            <div className={styles.buttonDesc}>Waiting</div>
          </div>
        </div>
      </Col>

      <Col className={`${styles.col} ${styles.hideOnMobile}`} span={2}>
        <div className={`${styles.buttonContainer} ${styles.noMoreBtn}`}>
          <div className={styles.button} onClick={handleChatClick}>
            <Badge count={unreadChatMessages.length}><MessageFilled className={styles.buttonIcon} /></Badge>
            <div className={styles.buttonDesc}>Chat</div>
          </div>
        </div>
      </Col>

      <Col className={`${styles.col} ${styles.hideOnMobile}`} span={2}>
        <div className={`${styles.buttonContainer} ${styles.noMoreBtn}`}>
          <div className={styles.button} onClick={handleCopyRoomIdClick}>
            <CopyOutlined className={styles.buttonIcon} />
            <div className={styles.buttonDesc}>Room Id</div>
          </div>
        </div>
      </Col>

      {(!sharingScreen || sharingScreen.socketId === socketIO.socket.id) ?
      <Col className={`${styles.col} ${styles.hideOnMobile}`} span={2}>
        <div className={`${styles.buttonContainer} ${styles.noMoreBtn}`}>
          <div className={styles.button} onClick={handleScreenShareClick}>
            { sharingScreen ? <FundProjectionScreenOutlined className={styles.buttonIcon} /> : <FundViewOutlined className={styles.buttonIcon} /> }
            <div className={styles.buttonDesc}>{ sharingScreen ? 'Stop' : 'Share Screen' }</div>
          </div>
        </div>
      </Col>
      : null}

      <Col className={`${styles.col} ${styles.hideOnMobile}`} span={2}>
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