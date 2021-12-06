import EventEmitter from 'events';
import { isEqual } from 'lodash';
import store from '../store';
import { addChatMessage } from '../store/roomReducer';
import { userShareScreen } from '../store/roomReducer';
import { socketIO } from './socketio';

window.isEqual = isEqual;
let handleWebRTCSignaling;

export class WebRTC {

	static webRTC;

	constructor({  mediaStreamConstraints, turnCredential }) {
		this.currentUserId = store.getState().user.id;
		this.event = new EventEmitter();
		this.mediaStreamConstraints = mediaStreamConstraints;
		this.configuration = {
			iceServers: [
				{ url: 'stun:stun.l.google.com:19302' },
				{ url: 'stun:stun1.l.google.com:19302' },
				{ url: 'stun:stun2.l.google.com:19302' },
				{
		      urls: "turn:171.97.6.230:3478",  // A TURN server
		      username: turnCredential.username,
		      credential: turnCredential.password
		    }
			]
		};

		handleWebRTCSignaling = this.handleWebRTCSignaling.bind(this);

		socketIO.socket.on('webrtc-signaling', handleWebRTCSignaling);

		// peer for webcam/chat peer connection
		this.peerConnections = []; // [{ userId: Integer, socketId: string, stream: mediaStream, pc: RTCPeerConnection, dataChannel: RTCDataChannel }]
		
		// peers for for screen share presenter
		this.shareScreenPeerConnections = []; // [{ userId: Integer, socketId: string, pc: RTCPeerConnection }]

		// peer for screen share receiver
		this.shareScreenPeerConnection = null; // { userId: Integer, socketId: string, stream: mediaStream, pc: RTCPeerConnection }

		const participants = store.getState().room.participants;
		participants.forEach(participant => {
			// if(participant.id === this.currentUserId) { return }
			if(!participant.admitted) { return }
			participant.sockets.forEach(s => {
				if(s.socketId === socketIO.socket.id) { return } // user shouldn't be connected to the current socket
				this.peerConnections.push({ userId: participant.id, socketId: s.socketId, stream: null, pc: new RTCPeerConnection(this.configuration) });
			});
		});
	}

	static getInstance(constraints) {
		if(!WebRTC.webRTC) { WebRTC.webRTC = new WebRTC(constraints) }
		return WebRTC.webRTC;
	}

	registerPeerConnectionEvents({ peerConnection, isScreenSharing=false }) {
		peerConnection.pc.onicecandidate = ({ candidate }) => socketIO.socket.emit('webrtc-signaling', { toSocketId: peerConnection.socketId, candidate, isScreenSharing });
		peerConnection.pc.ontrack = event => {
			console.log('ontrack', event);
			peerConnection.stream = event.streams[0];
			this.event.emit('stream', { userId: peerConnection.userId, socketId: peerConnection.socketId, stream: event.streams[0], type: isScreenSharing ? 'SCREEN_SHARING' : 'CAMERA' }); // notify component to update srcObj
		}
	}

	setupDataChannelOfferSide(peerConnection) {
		const chatChannel = peerConnection.pc.createDataChannel("chat");
		peerConnection.dataChannel = chatChannel;
		chatChannel.onmessage = event => {
			const data = JSON.parse(event.data);
	  	console.log('receive data channel:', data);
	    const { userId, message, timestamp } = data;
			const chatUIVisibility = store.getState().ui.chat.visibility;
			store.dispatch(addChatMessage({ userId, message, timestamp, read: chatUIVisibility }));
		}
	}

	setupDataChannelAnswerSide(peerConnection) {
		peerConnection.pc.ondatachannel = function(event) {
			const chatChannel = event.channel;
			peerConnection.dataChannel = chatChannel;
		  chatChannel.onmessage = function(event) {
		  	const data = JSON.parse(event.data);
		  	console.log('receive data channel:', data);
		    const { userId, message, timestamp } = data;
				const chatUIVisibility = store.getState().ui.chat.visibility;
				store.dispatch(addChatMessage({ userId, message, timestamp, read: chatUIVisibility }));
		  }
		}
	}

	sendDataChannelMessage(message) {
		this.peerConnections.forEach(peerConnection => peerConnection.dataChannel.send(JSON.stringify(message)));
	}

	participantChanges(participant, action, socketId) {
		// make new reference to object
		const participants = store.getState().room.participants;
		// on user-admitted, socketId will not be defined
		const socketIds = socketId ? [ socketId ] : participants.find(p => p.id === participant.id).sockets.map(s => s.socketId);
		if(action === 'UPDATE') {
			// user-admitted or user-joined
			socketIds.forEach(socketId => {
				if(!this.peerConnections.find(p => p.socketId === socketId)) {
					// if(this.currentUserId === participant.id) { return }
					this.peerConnections.push({ userId: participant.id, socketId, stream: null, pc: new RTCPeerConnection(this.configuration) });
					const peerConnection = this.peerConnections.find(p => p.socketId === socketId);
					this.registerPeerConnectionEvents({ peerConnection });
					this.setupDataChannelAnswerSide(peerConnection);
					// for screen sharing presenter
					if(this.screenSharingStream) {
						const shareScreenPeerConnection = { userId: participant.id, socketId, pc: new RTCPeerConnection(this.configuration) };
						this.shareScreenPeerConnections.push(shareScreenPeerConnection);
						this.registerPeerConnectionEvents({ peerConnection: shareScreenPeerConnection, isScreenSharing: true });
						this.screenSharingStream.getTracks().forEach((track) => shareScreenPeerConnection.pc.addTrack(track, this.screenSharingStream));
						this.startWebRTCSignaling({ peerConnection: shareScreenPeerConnection, isScreenSharing: true });
					}
				}
			});
		}
		if(action === 'REMOVE') {
			const peerConnectionIndex = this.peerConnections.findIndex(p => p.socketId === socketId);
			// close dataChannel if established
			if(this.peerConnections[peerConnectionIndex].dataChannel) { this.peerConnections[peerConnectionIndex].dataChannel.close() }
			// close RTCPeerConnection if established
			if(this.peerConnections[peerConnectionIndex].pc) 					{ this.peerConnections[peerConnectionIndex].pc.close(); }
			// remove peerConnection from the list
			this.peerConnections.splice(peerConnectionIndex, 1);
			// for screen sharing presenter
			if(this.screenSharingStream) {
				const shareScreenPeerIndex = this.shareScreenPeerConnections.findIndex(p => p.socketId === socketId);
				this.shareScreenPeerConnections[shareScreenPeerIndex].pc.close();
				this.shareScreenPeerConnections.splice(shareScreenPeerIndex, 1);
			}
			// for screen sharing receiver
			if(this.shareScreenPeerConnection) {
				if(this.shareScreenPeerConnection.userId === participant.id) {
					this.shareScreenPeerConnection.pc.close();
					this.shareScreenPeerConnection = null;
				}
			}
			console.log('updated peerConnections:', this.peerConnections);
		}
	}
	async startWebRTCSignaling({ peerConnection, isScreenSharing=false }) {
		try {
	    await peerConnection.pc.setLocalDescription(await peerConnection.pc.createOffer());
	    socketIO.socket.emit('webrtc-signaling', { toSocketId: peerConnection.socketId, description: peerConnection.pc.localDescription, isScreenSharing });
	  } catch (err) {
	    console.error(err);
	  }
	}
	async handleWebRTCSignaling({ fromSocketId, candidate, description, isScreenSharing=false }) {
		console.log('handleWebRTCSignaling:', { fromSocketId, candidate, description, isScreenSharing });
		const participants = store.getState().room.participants;
		try {
			// check if user eligible for signaling
			const participantIndex = participants.findIndex(participant => {
				for(let socket of participant.sockets) { if(socket.socketId === fromSocketId) { return true } }
				return false;
			});
			if(participantIndex === -1) { return console.log('userId not found in participants (id):', fromSocketId); }
			if(!participants[participantIndex].admitted) { return console.log('user is not admitted to the room. RTCConnection refused'); }
			// set variables
			let rtcPeerConnection;
			const isCameraChat 							= !isScreenSharing;
			const isScreenSharingPresenter 	= isScreenSharing && !!this.screenSharingStream;
			const isScreenSharingReceiver		= isScreenSharing && !this.screenSharingStream;
			// for camera/chat
			if(isCameraChat) { rtcPeerConnection = this.peerConnections.find(p => p.socketId === fromSocketId) }
			// for screen sharing presenter
			if(isScreenSharingPresenter)  { rtcPeerConnection = this.shareScreenPeerConnections.find(p => p.socketId === fromSocketId) }
			// for screen sharing receiver
			if(isScreenSharingReceiver)  {
				if(!this.shareScreenPeerConnection) {
					const userId = participants[participantIndex].id;
					const socketId = fromSocketId;
					this.shareScreenPeerConnection = { userId, socketId, pc: new RTCPeerConnection(this.configuration) };
					this.registerPeerConnectionEvents({ peerConnection: this.shareScreenPeerConnection, isScreenSharing: true });
					store.dispatch(userShareScreen({ userId, socketId }));
				}
				rtcPeerConnection = this.shareScreenPeerConnection
			}
			console.log(`isCameraChat: ${isCameraChat}\nisScreenSharingPresenter: ${isScreenSharingPresenter}\nisScreenSharingReceiver: ${isScreenSharingReceiver}\n`, 'shareScreenPeerConnections: ', this.shareScreenPeerConnections, 'peerConnections: ', this.peerConnections);
			if(!rtcPeerConnection) { return console.log('cannot find peerConnection based on socketId', { fromSocketId, candidate, description, isScreenSharing }); }
			// handle WebRTC signaling
		  if(description) {
		    // If you get an offer, you need to reply with an answer.
		    if (description.type === 'offer') {
		    	console.log('got offer: ', description);
		      await rtcPeerConnection.pc.setRemoteDescription(description);
		      // add stream tracks to RTCPeerConnection
					if(isCameraChat || isScreenSharingPresenter) {
						const stream = isCameraChat ? this.stream : this.screenSharingStream;
						stream.getTracks().forEach((track) => rtcPeerConnection.pc.addTrack(track, stream));
					}
		      await rtcPeerConnection.pc.setLocalDescription(await rtcPeerConnection.pc.createAnswer());
		      socketIO.socket.emit('webrtc-signaling', { toSocketId: fromSocketId, description: rtcPeerConnection.pc.localDescription, isScreenSharing });
		    } else if (description.type === 'answer') {
		    	console.log('got answer: ', description);
		      await rtcPeerConnection.pc.setRemoteDescription(description);
		    } else {
		      console.log('Unsupported SDP type.');
		    }
		  } else if (candidate) {
		    await rtcPeerConnection.pc.addIceCandidate(candidate);
		  }
		} catch (err) {
		  console.error(err);
		}
	}

	// Muted / Unmuted
	async updateMediaStreamSettings(socket) {
		if(socket.socketId !== socketIO.socket.id) { return }
		const { cameraMuted, micMuted } = socket;
		const mediaStreamConstraints = { audio: !micMuted && this.mediaStreamConstraints.audio, video: !cameraMuted && this.mediaStreamConstraints.video };
		const stream = cameraMuted && micMuted ? null : await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
		this.stream.getTracks().forEach(oldTrack => {
			// stop track if device is muted
			if((oldTrack.kind === 'video' && cameraMuted) || (oldTrack.kind === 'audio' && micMuted)) {
				oldTrack.stop();
				return;
			}
			// replace tracks if device is not muted
			stream.getTracks().forEach(newTrack => {
				if(oldTrack.kind !== newTrack.kind) { return }
				oldTrack.stop();
				this.stream.removeTrack(oldTrack);
				this.stream.addTrack(newTrack);
				// replace peerConnection track
				this.peerConnections.forEach(peerConnection => {
					const sender = peerConnection.pc.getSenders().find(sender => sender.track.kind === oldTrack.kind);
					sender.replaceTrack(newTrack);
				});
			});
		});
		this.event.emit('local-stream', this.stream);
	}

	// Media devices
	async changeMediaStreamTrack({ mediaStreamConstraints }) {
		this.mediaStreamConstraints = mediaStreamConstraints;
		console.log('changeMediaStreamTrack called');
		// get current mute/unmute state
		const user = store.getState().user;
		const { cameraMuted, micMuted } = store.getState().room.participants.find(p => p.id === user.id).sockets.find(s => s.socketId === socketIO.socket.id);
		mediaStreamConstraints = { audio: !micMuted && mediaStreamConstraints.audio, video: !cameraMuted && mediaStreamConstraints.video };
		// replace track of local stream
		const stream = cameraMuted && micMuted ? null : await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
		const newTracks = [];
		this.stream.getTracks().forEach(oldTrack => {
			// skip if device is muted
			if((oldTrack.kind === 'video' && cameraMuted) || (oldTrack.kind === 'audio' && micMuted)) { return }
			// replace tracks
			stream.getTracks().forEach(newTrack => {
				if(oldTrack.kind !== newTrack.kind) { return }
				if(isEqual(oldTrack.getConstraints(), newTrack.getConstraints())) { return newTrack.stop(); }
				oldTrack.stop();
				this.stream.removeTrack(oldTrack);
				this.stream.addTrack(newTrack);
				newTracks.push(newTrack);
			});
		});
		this.event.emit('local-stream', this.stream);
		// replace track of senders
		newTracks.forEach(newTrack => {
			this.peerConnections.forEach(peerConnection => {
				peerConnection.pc.getSenders().forEach(sender => {
					if(sender.track.kind === newTrack.kind) {
						sender.replaceTrack(newTrack);
					}
				});
			});
		});
	}

	async shareScreen(stopSharingCallback) {
		try {
			window.screenSharingStream = this.screenSharingStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
		} catch(err) { // pwermission issue or user cancel sharing
			console.error(err);
			stopSharingCallback();
			return;
		}
		this.shareScreenPeerConnections = this.peerConnections.filter(p => p.admitted).map(p => ({ userId: p.userId, socketId: p.socketId, pc: new RTCPeerConnection(this.configuration) }));
		this.shareScreenPeerConnections.forEach(peerConnection => {
			this.registerPeerConnectionEvents({ peerConnection, isScreenSharing: true });
			this.screenSharingStream.getTracks().forEach((track) => peerConnection.pc.addTrack(track, this.screenSharingStream));
			this.startWebRTCSignaling({ peerConnection, isScreenSharing: true });
		});
		this.screenSharingStream.getVideoTracks()[0].onended = stopSharingCallback;
		this.event.emit('local-stream', { stream: this.screenSharingStream, type: 'SCREEN_SHARING' });
	}

	stopSharingScreen() {
		// for screen sharing presenter
		if(this.shareScreenPeerConnections) {
			this.shareScreenPeerConnections.forEach(peerConnection => peerConnection.pc.close());
			this.shareScreenPeerConnections = [];
		}
		if(this.screenSharingStream) {
			this.screenSharingStream.getTracks().forEach(track => track.stop());
			this.screenSharingStream = null;
		}
		// for screen sharing receiver
		if(this.shareScreenPeerConnection) {
			this.shareScreenPeerConnection.pc.close();
			this.shareScreenPeerConnection = null;
		}
	}

	async start() {
		try {
	    window.stream = this.stream = await navigator.mediaDevices.getUserMedia(this.mediaStreamConstraints);
	    this.peerConnections.forEach(peerConnection => {
				this.registerPeerConnectionEvents({ peerConnection });
				this.setupDataChannelOfferSide(peerConnection);
	    	this.stream.getTracks().forEach((track) => peerConnection.pc.addTrack(track, this.stream));
				this.startWebRTCSignaling({ peerConnection });
	    });
	    this.event.emit('local-stream', { stream: this.stream, type: 'CAMERA' });
	  } catch (err) {
	    console.error(err);
	  }
	}

	destroy() {
		this.peerConnections.forEach(rtcPeerConnection => {
			if(rtcPeerConnection.dataChannel) { rtcPeerConnection.dataChannel.close() }
			if(rtcPeerConnection.pc) 					{ rtcPeerConnection.pc.close() }
		});
		this.stopSharingScreen();
		if(socketIO.socket) {
			socketIO.socket.off('webrtc-signaling', handleWebRTCSignaling);
		}
		if(this.stream) { this.stream.getTracks().forEach(track => track.stop()) }
		WebRTC.webRTC = null;
	}
}
