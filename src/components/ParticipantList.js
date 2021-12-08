import { useSelector, useDispatch } from 'react-redux';
import { participantListVisibility } from '../store/uiReducer';
import { Card, List, Badge, Avatar, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import styles from './ParticipantList.module.css';

const ProfileImage = participant => {
  if(participant.sockets && participant.sockets.length) {
    return <Badge dot style={{backgroundColor: 'limegreen', width: '0.5rem', height: '0.5rem'}} offset={[-3, 26]}><Avatar src={participant.imgUrl} /></Badge>;
  }
  return <Avatar src={participant.imgUrl} />;
}

const ParticipantList = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.user.id);
  const ownerId = useSelector(state => state.room.data.ownerId);
  const visibility = useSelector(state => state.ui.participantList.visibility);
  const participants = useSelector(state => state.room.participants.filter(item => item.admitted));
  const userDesc = participant => {
    const desc = [];
    if(participant.id === ownerId) { desc.push('Host') }
    if(participant.id === userId)  { desc.push('Me') }
    return desc.length ? ` (${desc.join(', ')})` : '';
  }
  return (
    <Card title="Participants" className={`${styles.card} ${!visibility ? styles.hide : ''}`} extra={ <Button onClick={() => dispatch(participantListVisibility(false))} shape="circle" icon={<CloseOutlined />} />} bordered={false}>
      <div className={styles.listContainer}>
        <List
          itemLayout="horizontal"
          dataSource={participants}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={ProfileImage(item)}
                title={`${item.fName} ${item.lName}${userDesc(item)}`}
                description={item.email}
              />
            </List.Item>
          )}
        />
      </div>
    </Card>
  )
}

export default ParticipantList;