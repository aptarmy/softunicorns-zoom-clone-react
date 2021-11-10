import EventEmitter from 'events';
import { isEqual } from 'lodash';
import store from '../store';
import { addChatMessage } from '../store/roomReducer';
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

		this.peerConnections = []; // [{ userId: Integer, socketId: string, MediaStream: mediaStream, pc: RTCPeerConnection, dataChannel: RTCDataChannel }]
		const participants = store.getState().room.participants;
		participants.forEach(participant => {
			if(participant.id === this.currentUserId) { return }
			if(!participant.admitted) { return }
			participant.sockets.forEach(s => {
				this.peerConnections.push({ userId: participant.id, socketId: s.socketId, stream: null, pc: new RTCPeerConnection(this.configuration) });
			});
		});
		this.peerConnections.forEach(peerConnection => {
			this.registerPeerConnectionEvents(peerConnection);
			this.setupDataChannelOfferSide(peerConnection);
		});
	}

	static getInstance({ mediaStreamConstraints: { audio, video }, turnCredential: { username, password } }) {
		if(!WebRTC.webRTC) { WebRTC.webRTC = new WebRTC({ mediaStreamConstraints: { audio, video }, turnCredential: { username, password } }) }
		return WebRTC.webRTC;
	}

	registerPeerConnectionEvents(peerConnection) {
		peerConnection.pc.onicecandidate = ({ candidate }) => socketIO.socket.emit('webrtc-signaling', { toSocketId: peerConnection.socketId, candidate })
		// onnegotiationneeded fired once when track is added to RTCPeerConnection
		// peerConnection.pc.onnegotiationneeded = async () => {
		// 	console.log('onnegotiationneeded');
		//   this.startWebRTCSignaling(peerConnection);
		// };
		peerConnection.pc.ontrack = event => {
			console.log('ontrack', event);
			peerConnection.stream = event.streams[0];
			this.event.emit('stream', { socketId: peerConnection.socketId }); // notify component to update srcObj
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
		// on user-admitted socketId will be default to first socketId
		if(!socketId) { socketId = participants.find(p => p.id === participant.id).sockets[0].socketId }
		if(action === 'UPDATE') {
			// user-admitted or user-joined
			if(!this.peerConnections.find(p => p.socketId === socketId)) {
				if(this.currentUserId === participant.id) { return }
				this.peerConnections.push({ userId: participant.id, socketId, stream: null, pc: new RTCPeerConnection(this.configuration) });
				this.registerPeerConnectionEvents(this.peerConnections.find(p => p.socketId === socketId));
				this.setupDataChannelAnswerSide(this.peerConnections.find(p => p.socketId === socketId));
			}
		}
		if(action === 'REMOVE') {
			const peerConnectionIndex = this.peerConnections.findIndex(p => p.socketId === socketId);
			this.peerConnections[peerConnectionIndex].dataChannel.close();
			this.peerConnections[peerConnectionIndex].pc.close();
			this.peerConnections.splice(peerConnectionIndex, 1);
			console.log('updated peerConnections:', this.peerConnections);
		}
	}
	async startWebRTCSignaling(peerConnection) {
		try {
	    await peerConnection.pc.setLocalDescription(await peerConnection.pc.createOffer());
	    socketIO.socket.emit('webrtc-signaling', { toSocketId: peerConnection.socketId, description: peerConnection.pc.localDescription });
	  } catch (err) {
	    console.error(err);
	  }
	}
	async handleWebRTCSignaling({ fromSocketId, candidate, description }) {
		console.log('handleWebRTCSignaling:', { fromSocketId, candidate, description });
		const participants = store.getState().room.participants;
		try {
			const participantIndex = participants.findIndex(participant => {
				for(let socket of participant.sockets) { if(socket.socketId === fromSocketId) { return true } }
				return false;
			});
			if(participantIndex === -1) { return console.log('userId not found in participants (id):', fromSocketId); }
			if(!participants[participantIndex].admitted) { return console.log('user is not admitted to the room. RTCConnection refused'); }
			const rtcPeerConnection = this.peerConnections.find(p => p.socketId === fromSocketId);
			if(!rtcPeerConnection) { return console.log('cannot find peerConnection based on socketId:', fromSocketId); }
		  if(description) {
		    // If you get an offer, you need to reply with an answer.
		    if (description.type === 'offer') {
		    	console.log('got offer: ', description);
		      await rtcPeerConnection.pc.setRemoteDescription(description);
		      // this addTrack method is not going to fire onnegotiationneeded, because it is fired once track is added or removed
		      this.stream.getTracks().forEach((track) => rtcPeerConnection.pc.addTrack(track, this.stream));
		      await rtcPeerConnection.pc.setLocalDescription(await rtcPeerConnection.pc.createAnswer());
		      socketIO.socket.emit('webrtc-signaling', { toSocketId: fromSocketId, description: rtcPeerConnection.pc.localDescription });
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

	updateMediaStreamSettings(socket) {
		if(socket.socketId !== socketIO.socket.id) { return }
		const { cameraMuted, micMuted } = socket;
		this.stream.getTracks().forEach(track => {
			if(track.kind==='video' &&  cameraMuted) { track.enabled = false }
			if(track.kind==='video' && !cameraMuted) { track.enabled = true }
		});
		this.stream.getTracks().forEach(track => {
			if(track.kind==='audio' &&  micMuted) { track.enabled = false }
			if(track.kind==='audio' && !micMuted) { track.enabled = true }
		});
	}

	async changeMediaStreamTrack({ mediaStreamConstraints }) {
		console.log('changeMediaStreamTrack called');
		// replace track of local stream
		const newTracks = [];
		const stream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
		this.stream.getTracks().forEach(oldTrack => {
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

	async start() {
		try {
	    window.stream = this.stream = await navigator.mediaDevices.getUserMedia(this.mediaStreamConstraints);
	    this.peerConnections.forEach(peerConnection => {
	    	// addTrack trigger onnegotiationneeded event
	    	this.stream.getTracks().forEach((track) => peerConnection.pc.addTrack(track, this.stream));
	    	this.startWebRTCSignaling(peerConnection);
	    });
	    this.event.emit('local-stream', this.stream);
	  } catch (err) {
	    console.error(err);
	  }
	}

	destroy() {
		this.peerConnections.forEach(rtcPeerConnection => {
			rtcPeerConnection.dataChannel.close()
			rtcPeerConnection.pc.close();
		});
		if(socketIO.socket) {
			socketIO.socket.off('webrtc-signaling', handleWebRTCSignaling);
		}
		if(this.stream) { this.stream.getTracks().forEach(track => track.stop()) }
		WebRTC.webRTC = null;
	}
}
