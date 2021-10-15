import { useEffect } from 'react';
import { Input, Divider, Button, Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import FullPageTemplate from '../templates/FullPage';
import { login } from '../store/userReducer';
import { setTobeRedirected } from '../store/redirectReducer';
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
    <div>
      <Search placeholder="Enter Room ID" onSearch={handleEnterRoomSubmit} enterButton="Enter Room" />
      <Divider dashed></Divider>
      <div style={{ textAlign: 'center' }}><Button onClick={handleCreateRoomClick}>Create Room</Button></div>
    </div>
  )
}

const HomeWithTemplate = () => <FullPageTemplate children={<Home/>}/>;
export default HomeWithTemplate;