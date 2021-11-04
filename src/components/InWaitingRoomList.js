import { useSelector, useDispatch } from 'react-redux';
import { inWaitingRoomListVisibility } from '../store/uiReducer';
import { Card, List, Avatar, Button, ConfigProvider } from 'antd';
import { CloseOutlined, SmileOutlined } from '@ant-design/icons';
import { socketIO } from '../helpers/socketio';
import styles from './InWaitingRoomList.module.css';

const customizedListEmpty = () => (
  <div className={styles.customizedListEmpty}>
    <SmileOutlined style={{ fontSize: 20 }} />
    <p>No one in waiting room</p>
  </div>
);

const ParticipantList = () => {
  const dispatch = useDispatch();
  const room = useSelector(state => state.room);
  const user = useSelector(state => state.user);
  const visibility = useSelector(state => state.ui.inWaitingRoomList.visibility);
  const chatVisibility = useSelector(state => state.ui.chat.visibility);
  const participants = useSelector(state => state.room.participants.filter(item => !item.admitted));
  const handleOnClickAdmit = userId => socketIO.socket.emit('user-admitted', userId);
  return (
    <Card title="In waiting room" className={`${styles.card} ${!visibility ? styles.hide : ''} ${chatVisibility ? styles.chatVisible : ''}`} extra={ <Button onClick={() => dispatch(inWaitingRoomListVisibility(false))} shape="circle" icon={<CloseOutlined />} />} bordered={false}>
      <div className={styles.listContainer}>
      <ConfigProvider renderEmpty={customizedListEmpty}>
          <List
            itemLayout="horizontal"
            dataSource={participants}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar src={item.imgUrl} />}
                  title={`${item.fName} ${item.lName}`}
                  description={item.email}
                />
                {room.data.ownerId === user.id && <Button type="primary" onClick={() => handleOnClickAdmit(item.id)}>Admit</Button>}
              </List.Item>
            )}
          />
        </ConfigProvider>
      </div>
    </Card>
  )
}

export default ParticipantList;