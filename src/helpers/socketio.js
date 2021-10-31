import { io } from 'socket.io-client';
import { message } from 'antd';
import store from '../store';

class SocketIO {
	constructor() {
		this.socket = null;
	}
	connect(roomSlug) {
		if(this.socket) { this.socket.disconnect() }
		const { token } = store.getState().user;
		if(!token) { return message.error('You are not logged in.') }
		this.socket = io(process.env.REACT_APP_API_SERVER, {
			auth: { token },
			query: { roomSlug }
		});
		this.socket.on('connect', socket => console.log('webSocket connected to server'));
		this.socket.on('connect_error', err => {
			console.error(err);
			message.error(`WebSocket error: ${err.message}`);
		});
	}
	disconnect() {
		if(!this.socket) { return }
    console.log('disconnect socket');
		this.socket.disconnect();
		this.socket = null;
	}
}

export const socketIO = new SocketIO();