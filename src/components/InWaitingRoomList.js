import { useSelector, useDispatch } from 'react-redux';
import { inWaitingRoomListVisibility } from '../store/uiReducer';
import { Card, List, Avatar, Button, ConfigProvider } from 'antd';
import { CloseOutlined, SmileOutlined } from '@ant-design/icons';
import styles from './InWaitingRoomList.module.css';

const data = [
  { title: 'Thailand' },
  { title: 'Pakpoom' }
];

const customizedListEmpty = () => (
  <div className={styles.customizedListEmpty}>
    <SmileOutlined style={{ fontSize: 20 }} />
    <p>No one in waiting room</p>
  </div>
);

const ParticipantList = () => {
  const dispatch = useDispatch();
  const visibility = useSelector(state => state.ui.inWaitingRoomList.visibility);
  return (
    <Card title="In waiting room" className={`${styles.card} ${!visibility ? styles.hide : ''}`} extra={ <Button onClick={() => dispatch(inWaitingRoomListVisibility(false))} shape="circle" icon={<CloseOutlined />} />} bordered={false}>
      <div className={styles.listContainer}>
      <ConfigProvider renderEmpty={customizedListEmpty}>
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
                <Button type="primary">Allow</Button>
              </List.Item>
            )}
          />
        </ConfigProvider>
      </div>
    </Card>
  )
}

export default ParticipantList;