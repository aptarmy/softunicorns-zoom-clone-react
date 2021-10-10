import { Link } from "react-router-dom";
import { PageHeader, Button, Menu, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons'

const menu = () => (
  <Menu>
    <Menu.Item key="1">
      <Link to="/room">Room</Link>
    </Menu.Item>
    <Menu.Item key="2">
      <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
        2nd menu item
      </a>
    </Menu.Item>
    <Menu.Item key="3">
      <a target="_blank" rel="noopener noreferrer" href="https://www.luohanacademy.com">
        3rd menu item
      </a>
    </Menu.Item>
  </Menu>
)

const Header = () => (
  <PageHeader
    avatar={{ children: 'S', style: { backgroundColor: '#f56a00', verticalAlign: 'middle' }, size: 'large', gap: '4' }}
    ghost={false}
    title="Zoom Clone"
    subTitle="powered by SoftUnicorns"
    style={{ padding: '8px 24px', height: 64 }}
    extra={[
      <Button key="1" type="primary" to="">
        <Link to="/">Home</Link>
      </Button>,
      <Dropdown key="2" overlay={menu} placement="bottomRight">
        <Button type="link" icon={<UserOutlined/>}>Pakpoom</Button>
      </Dropdown>,
    ]}
  />
)

export default Header;