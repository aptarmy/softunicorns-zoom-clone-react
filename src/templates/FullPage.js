import HeaderBar from '../components/HeaderBar';
import { Layout } from 'antd';
import styles from './FullPage.module.css';
const { Content, Footer } = Layout;

const FullPageTemplate = props => (
  <div className={styles.layoutContainer}>
    <Layout className={styles.layout}>
      <HeaderBar />
      <Content className={styles.content}>
        {props.children}
      </Content>
      <Footer className={styles.footer}>
        Zoom Clone 2021 Created by SoftUnicorns
      </Footer>
    </Layout>
  </div>
);

export default FullPageTemplate;