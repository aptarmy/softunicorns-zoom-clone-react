import { Avatar } from 'antd';
import styles from './VideoAvatar.module.css';

const VideoAvatar = props => (
	<div className={`${props.className} ${styles.avatarContainer}`}>
		<Avatar className={styles.avatar} src={props.imgUrl} />
	</div>
);

export default VideoAvatar;