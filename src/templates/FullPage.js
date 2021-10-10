import HeaderBar from '../components/HeaderBar';
import { Layout } from 'antd';
const { Content, Footer } = Layout;

const FullPageTemplate = props => (
  <Layout style={{ backgroundColor: 'white' }}>
    <HeaderBar />
    <Content style={{ padding: '16px 50px' }}>
      {props.children}
    </Content>
    <Footer style={{ textAlign: 'center', backgroundColor: 'white' }}>
      Zoom Clone 2021 Created by SoftUnicorns
    </Footer>
  </Layout>
);

export default FullPageTemplate;