import styles from './Loader.module.css';

const Loader = props => (
	<>
		<div className={styles['lds-roller']}>
			<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
		</div>
		{props.text && <div className={styles['lds-text']}>{props.text}</div>}
	</>
);

export default Loader;