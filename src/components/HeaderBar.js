import { Link } from "react-router-dom";
import { PageHeader, Button, Menu, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { login, logout } from "../store/userReducer";

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
        <Button type="link" icon={<UserOutlined/>}>{user.fName}</Button>
      </Dropdown>,
    ]
  }
  if(user.id === null) {
    extra = [
      <Button key="1" type="primary" onClick={() => { dispatch(login()); message.success('Logged in'); }}>
        Login
      </Button>
    ]
  }
  return (
    <PageHeader
      avatar={{ children: 'S', style: { backgroundColor: '#f56a00', verticalAlign: 'middle' }, size: 'large', gap: '4' }}
      ghost={false}
      title="Zoom Clone"
      subTitle="powered by SoftUnicorns"
      style={{ padding: '8px 24px', height: 64 }}
      extra={extra}
    />
  );
}

export default Header;