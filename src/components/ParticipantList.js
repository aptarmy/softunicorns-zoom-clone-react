import { useSelector, useDispatch } from 'react-redux';
import { participantListVisibility } from '../store/uiReducer';
import { Card, List, Avatar, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import styles from './ParticipantList.module.css';

const data = [
  { title: 'test 1' },
  { title: 'test 2' }
];

const ParticipantList = () => {
  const dispatch = useDispatch();
  const visibility = useSelector(state => state.ui.participantList.visibility);
  return (
    <Card title="Participants" className={`${styles.card} ${!visibility ? styles.hide : ''}`} extra={ <Button onClick={() => dispatch(participantListVisibility(false))} shape="circle" icon={<CloseOutlined />} />} bordered={false}>
      <div className={styles.listContainer}>
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                title={item.title}
                description="apt.enjoy@gmail.com"
              />
            </List.Item>
          )}
        />
      </div>
    </Card>
  )
}

export default ParticipantList;