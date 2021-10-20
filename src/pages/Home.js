import { useState, useEffect } from 'react';
import { Input, Button, Card } from 'antd';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import FullPageTemplate from '../templates/FullPage';
import LogInModal from '../components/LogInModal';
import { login } from '../store/userReducer';
import { setTobeRedirected } from '../store/redirectReducer';
import styles from './Home.module.css';
const { Search } = Input;

const Home = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const redirect = useSelector(state => state.redirect);
  const history = useHistory();
  useEffect(() => {
    if(redirect.meta && redirect.meta.type === 'AUTH_REQUIRED') {
      openLoginModal({ title: 'Please log in', child: 'Before entering the room, you need to be logged in using your Google account' });
    }
  });
  // login modal
  const [ loginModal, setLoginModal ] = useState({ visible: false, title: '', child: '' });
  // listen user for modal visibility
  useEffect(() => {
    if(user.id !== null) {
      setLoginModal({ ...loginModal, visible: false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ user ]);
  const loginModalHandleSuccess = googleResponse => {
    console.log('login success:', googleResponse);
    const token = googleResponse.tokenObj.id_token;
    dispatch(login(token));
  }
  const loginModalHandleCancel = () => {
    dispatch(setTobeRedirected(null));
    setLoginModal({ ...loginModal, visible: false });
  }
  const loginModalHandleFailure = response => {
    console.log('error while logging in:', response);
  }
  const openLoginModal = ({ title, child }) => {
    setLoginModal({ ...loginModal, title, child, visible: true });
  }
  const handleEnterRoomSubmit = () => {
    if(user.id === null) {
      openLoginModal({ title: 'Please log in', child: 'Before entering the room, you need to be logged in using your Google account' });
    }
    if(user.id !== null) {
      history.push('/room');
    }
  }
  const handleCreateRoomClick = () => {
    if(user.id === null) {
      openLoginModal({ title: 'Please log in', child: 'Before creating a room, you need to be logged in using your Google account' });
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
      <LogInModal modal={loginModal} handleSuccess={loginModalHandleSuccess} handleCancel={loginModalHandleCancel} handleFailure={loginModalHandleFailure} />
    </div>
  )
}

const HomeWithTemplate = () => <FullPageTemplate children={<Home/>}/>;
export default HomeWithTemplate;