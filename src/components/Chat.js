import { SendOutlined, CloseCircleFilled } from '@ant-design/icons';
import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addChatMessage } from '../store/roomReducer'
import { chatVisibility } from '../store/uiReducer';
import { Input, Comment, List, Button } from 'antd';
import moment from 'moment';
import { WebRTC } from '../helpers/webrtc';
import styles from './Chat.module.css';

const Chat = (props) => {
	const user = useSelector(state => state.user);
	const participants = useSelector(state => state.room.participants);
	const chatMessages = useSelector(state => state.room.chatMessages);
	const chatUI = useSelector(state => state.ui.chat);
	const [ textInput, setTextInput ] = useState('');
	const messages = chatMessages.map(chat => {
		const { sockets, ...participant } = participants.find(participant => participant.id === chat.userId);
		return { ...participant, ...chat };
	});
	const dispatch = useDispatch();
	const listContainerRef = useRef(null);

	const handleTextInputChange = e => setTextInput(e.target.value)

	const handleChatInputSubmit = () => {
		if(textInput.trim() === '') { return }
		const message = { userId: user.id, message: textInput.trim(), timestamp: new Date().getTime() };
		dispatch(addChatMessage({ ...message, read: true}));
		WebRTC.webRTC.sendDataChannelMessage(message);
		setTextInput('');
	};

	useEffect(() => {
		const chatMessageContainer = listContainerRef.current.querySelector('.ant-spin-nested-loading');
		chatMessageContainer.scrollTop = chatMessageContainer.scrollHeight;
	}, [ chatMessages ]);

	const listHeader = (
		<div>
			<Button type="text" shape="round" icon={<CloseCircleFilled />} size="small" onClick={() => dispatch(chatVisibility(false))} className={styles.closeButton} />
			<div className={styles.chatHeader}>Chat</div>
		</div>
	);

	return (
		<div ref={listContainerRef} className={`${styles.chat} ${chatUI.visibility ? '' : styles.hide}`}>
			<List className={styles.chatMessages} header={listHeader} itemLayout="horizontal" dataSource={messages} renderItem={message => (
				<li>
					<Comment author={`${message.fName} ${message.lName}`} avatar={message.imgUrl} content={message.message} datetime={moment(message.timestamp).format('HH:ss:mm - D MMMM')} />
				</li>
			)} />
			<Input className={styles.textInput} placeholder="input search text" value={textInput} onChange={handleTextInputChange} onPressEnter={handleChatInputSubmit} suffix={<SendOutlined />} />
		</div>
	)
}

export default Chat;