import styles from './BlankPage.module.css';

const BlankPageTemplate = props => (
  <div className={styles.blankPageContainer}>
    {props.children}
  </div>
)

export default BlankPageTemplate;