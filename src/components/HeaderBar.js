import { Link } from "react-router-dom";
import { PageHeader, Button, Menu, Dropdown } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { login, logout } from "../store/userReducer";
import styles from './HeaderBar.module.css';

const Header = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  // debuggin
  window.logout = () => dispatch(logout());
  const dropdownMenuOnClick = ({ key }) => {
    if(key === 'logout') { dispatch(logout()); message.success('Logged out') }
  }
  let extra;
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
      <Button key="1" type="dashed" ghost icon={<LockOutlined />} onClick={() => { dispatch(login()); message.success('Logged in'); }}>
        Login
      </Button>
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