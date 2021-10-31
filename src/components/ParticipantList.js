import { useSelector, useDispatch } from 'react-redux';
import { participantListVisibility } from '../store/uiReducer';
import { Card, List, Avatar, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import styles from './ParticipantList.module.css';

const ParticipantList = () => {
  const dispatch = useDispatch();
  const visibility = useSelector(state => state.ui.participantList.visibility);
  const participants = useSelector(state => state.room.participants.filter(item => item.admitted));
  return (
    <Card title="Participants" className={`${styles.card} ${!visibility ? styles.hide : ''}`} extra={ <Button onClick={() => dispatch(participantListVisibility(false))} shape="circle" icon={<CloseOutlined />} />} bordered={false}>
      <div className={styles.listContainer}>
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
            </List.Item>
          )}
        />
      </div>
    </Card>
  )
}

export default ParticipantList;