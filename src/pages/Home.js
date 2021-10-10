import { Input, Divider, Button } from 'antd';
import FullPageTemplate from '../templates/FullPage';
const { Search } = Input;

const Home = () => (
  <div>
    <Search placeholder="Enter Room ID" onSearch={(e) => console.log(e)} enterButton />
    <Divider dashed></Divider>
    <div style={{ textAlign: 'center' }}><Button>Create Room</Button></div>
  </div>
)

const HomeWithTemplate = () => <FullPageTemplate children={<Home/>}/>;
export default HomeWithTemplate;