import { useEffect } from 'react';
import { Input, Button, Modal, Card, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import FullPageTemplate from '../templates/FullPage';
import { login } from '../store/userReducer';
import { setTobeRedirected } from '../store/redirectReducer';
import styles from './Home.module.css';
const { Search } = Input;

const Home = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const redirect = useSelector(state => state.redirect);
  const { confirm } = Modal;
  const history = useHistory();
  useEffect(() => {
    if(redirect.meta && redirect.meta.type === 'AUTH_REQUIRED') {
      const modal = confirm({
        title: 'You must be logged in',
        icon: <ExclamationCircleOutlined />,
        content: 'Before entering the room, you need to be logged in using your Google account',
        onOk() { dispatch(login()); message.success('Logged in'); },
        onCancel() { dispatch(setTobeRedirected(null)); },
        centered: true
      });
      return () => modal.destroy();
    }
  });
  const openLoginModal = () => {
    return confirm({
      title: 'Please log in',
      icon: <ExclamationCircleOutlined />,
      content: 'Before entering the room, you need to be logged in using your Google account',
      onOk() { dispatch(login()); message.success('Logged in'); history.push('/room'); },
      onCancel() { console.log('Cancel') },
      centered: true
    });
  }
  const handleEnterRoomSubmit = () => {
    if(user.id === null) {
      openLoginModal();
    }
    if(user.id !== null) {
      history.push('/room');
    }
  }
  const handleCreateRoomClick = () => {
    if(user.id === null) {
      openLoginModal();
    }
    if(user.id !== null) {
      history.push('/room');
    }
  }
  return (
    <div className={styles.siteContent}>
      <Card className={styles.card} bordered={false}>
        <Search className={styles.search} placeholder="Enter Room ID" onSearch={handleEnterRoomSubmit} enterButton="Enter Room" size="large" />
        <div className={styles.divider}>OR</div>
        <div style={{ textAlign: 'center' }}><Button type="dashed" ghost onClick={handleCreateRoomClick} size="large">Create Room</Button></div>
      </Card>
    </div>
  )
}

const HomeWithTemplate = () => <FullPageTemplate children={<Home/>}/>;
export default HomeWithTemplate;