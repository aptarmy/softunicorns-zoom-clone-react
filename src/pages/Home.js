import { Input, Divider, Button, Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import FullPageTemplate from '../templates/FullPage';
import { login } from '../store/userReducer';
const { Search } = Input;

const Home = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const { confirm } = Modal;
  const history = useHistory();
  const handleEnterRoomSubmit = () => {
    if(user.id === null) {
      confirm({
        title: 'Please log in',
        icon: <ExclamationCircleOutlined />,
        content: 'Before entering the room, you need to be logged in using your Google account',
        onOk() { dispatch(login()); message.success('Logged in'); history.push('/room'); },
        onCancel() { console.log('Cancel') },
      });
    }
    if(user.id !== null) {
      history.push('/room');
    }
  }
  const handleCreateRoomClick = () => {
    if(user.id === null) {
      confirm({
        title: 'Please log in',
        icon: <ExclamationCircleOutlined />,
        content: 'Before creating a new room, you need to be logged in using your Google account',
        onOk() { dispatch(login()); message.success('Logged in'); history.push('/room'); },
        onCancel() { console.log('Cancel') },
        centered: true
      });
    }
    if(user.id !== null) {
      history.push('/room');
    }
  }
  return (
    <div>
      <Search placeholder="Enter Room ID" onSearch={handleEnterRoomSubmit} enterButton />
      <Divider dashed></Divider>
      <div style={{ textAlign: 'center' }}><Button onClick={handleCreateRoomClick}>Create Room</Button></div>
    </div>
  )
}

const HomeWithTemplate = () => <FullPageTemplate children={<Home/>}/>;
export default HomeWithTemplate;