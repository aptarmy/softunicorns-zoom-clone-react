import { useState, useEffect } from 'react';
import { Input, Button, Card } from 'antd';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import FullPageTemplate from '../templates/FullPage';
import LogInModal from '../components/LogInModal';
import { login } from '../store/userReducer';
import { setTobeRedirected } from '../store/redirectReducer';
import { stateSubscriber } from '../helpers/storeListener';
import styles from './Home.module.css';
const { Search } = Input;

const Home = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const redirect = useSelector(state => state.redirect);
  const history = useHistory();
  const [ roomIdInput, setRoomIdInput ] = useState('');
  useEffect(() => {
    if(redirect.meta && redirect.meta.type === 'AUTH_REQUIRED') {
      openLoginModal({ title: 'Please log in', child: 'Before entering the room, you need to be logged in using your Google account' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ redirect ]);
  // login modal
  const [ loginModal, setLoginModal ] = useState({ visible: false, title: '', child: '' });
  // listen user for modal visibility
  useEffect(() => {
    if(user.id !== null) {
      setLoginModal({ ...loginModal, visible: false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ user ]);
  const handleEnterRoom = () => {
    console.log('handleEnterRoom callback fired');
    history.push(`/room/${roomIdInput}`);
  }
  const handleCreateRoom = () => {
   console.log('handleCreateRoom callback fired');
    history.push(`/room`);
  }
  const loginModalHandleSuccess = googleResponse => {
    console.log('login success:', googleResponse);
    const token = googleResponse.tokenObj.id_token;
    dispatch(login(token));
    console.log('login dispatched');
  }
  const loginModalHandleCancel = () => {
    console.log('loginModalHandleCancel fired');
    dispatch(setTobeRedirected(null));
    stateSubscriber.unregister(handleEnterRoom);
    stateSubscriber.unregister(handleCreateRoom);
    setLoginModal({ ...loginModal, visible: false });
  }
  const loginModalHandleFailure = response => {
    console.log('error while logging in:', response);
  }
  const openLoginModal = ({ title, child }) => {
    setLoginModal({ ...loginModal, title, child, visible: true });
  }
  const handleChangeRoomId = e => setRoomIdInput(e.target.value);
  const handleEnterRoomSubmit = () => {
    if(roomIdInput.trim() === '') { return }
    if(user.id === null) {
      stateSubscriber.register(handleEnterRoom, 'USER_LOGGED_IN');
      openLoginModal({ title: 'Please log in', child: 'Before entering the room, you need to be logged in using your Google account' });
    }
    if(user.id !== null) { handleEnterRoom(); }
  }
  const handleCreateRoomClick = () => {
    if(user.id === null) {
      stateSubscriber.register(handleCreateRoom, 'USER_LOGGED_IN');
      openLoginModal({ title: 'Please log in', child: 'Before creating a room, you need to be logged in using your Google account' });
    }
    if(user.id !== null) { handleCreateRoom(); }
  }
  return (
    <div className={styles.siteContent}>
      <Card className={styles.card} bordered={false}>
        <Search className={styles.search} placeholder="Enter Room ID" value={roomIdInput} onChange={handleChangeRoomId} onSearch={handleEnterRoomSubmit} enterButton="Enter Room" size="large" />
        <div className={styles.divider}>OR</div>
        <div style={{ textAlign: 'center' }}><Button type="dashed" ghost onClick={handleCreateRoomClick} size="large">Create Room</Button></div>
      </Card>
      <LogInModal modal={loginModal} handleSuccess={loginModalHandleSuccess} handleCancel={loginModalHandleCancel} handleFailure={loginModalHandleFailure} />
    </div>
  )
}

const HomeWithTemplate = () => <FullPageTemplate children={<Home/>}/>;
export default HomeWithTemplate;