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
        Zoom Clone 2021 made with love by <a target="_blank" rel="noreferrer noopener" href="https://www.linkedin.com/in/pakpoom-tiwakornkit-955783190">Pakpoom Tiwakornkit</a>
      </Footer>
    </Layout>
  </div>
);

export default FullPageTemplate;