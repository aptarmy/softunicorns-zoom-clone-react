import { Link } from "react-router-dom";
import { PageHeader, Button, Menu, Dropdown } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { GoogleLogin } from 'react-google-login';
import { login, logout } from "../store/userReducer";
import styles from './HeaderBar.module.css';

const Header = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const dropdownMenuOnClick = ({ key }) => {
    if(key === 'logout') { dispatch(logout()); message.success('Logged out') }
  }
  let extra;
  const handleLoginSuccess = googleResponse => {
    console.log('login success:', googleResponse);
    const payload = { profile: googleResponse.profileObj, token: googleResponse.tokenObj };
    dispatch(login(payload));
    message.success('Logged in');
  }
  const handleLoginFailure = googleResponse => { console.log('error while loggin in :', googleResponse); }
  // user logged in
  if(user.id !== null) {
    const menu = () => (
      <Menu onClick={dropdownMenuOnClick}>
        <Menu.Item key="room">
          <Link to="/room">Room</Link>
        </Menu.Item>
        <Menu.Item key="logout">Logout</Menu.Item>
      </Menu>
    );    
    extra = [
      <Dropdown key="2" overlay={menu} placement="bottomRight">
        <Button type="dashed" ghost icon={<UserOutlined/>}>{user.fName}</Button>
      </Dropdown>,
    ]
  }
  if(user.id === null) {
    extra = [
      <GoogleLogin
        key="login"
        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
        onSuccess={handleLoginSuccess}
        onFailure={handleLoginFailure}
        render={renderProps => (
          <Button type="dashed" ghost icon={<LockOutlined />} onClick={renderProps.onClick}>
            Login
          </Button>
        )}
      />
    ]
  }
  return (
    <PageHeader
      className={styles.headerBar}
      avatar={{ children: 'S', style: { backgroundColor: '#f56a00', verticalAlign: 'middle' }, size: 'large', gap: '4' }}
      ghost={false}
      title={<span className={styles.siteName}>Zoom Clone</span>}
      subTitle={<span className={styles.siteDescription}>powered by SoftUnicorns</span>}
      extra={extra}
    />
  );
}

export default Header;