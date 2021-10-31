import EventEmitter from 'events';
import { socketIO } from './socketio';

let handleWebRTCSignaling;

export class WebRTC {
	constructor({ participants, mediaStreamConstrains, currentUserId }) {
		this.currentUserId = currentUserId;
		this.event = new EventEmitter();
		this.mediaStreamConstrains = mediaStreamConstrains;
		this.participants = JSON.parse(JSON.stringify(participants));
		this.configuration = {
			iceServers: [
				{ url: 'stun:stun.l.google.com:19302' },
				{ url: 'stun:stun1.l.google.com:19302' },
				{ url: 'stun:stun2.l.google.com:19302' },
			]
		};
		handleWebRTCSignaling = this.handleWebRTCSignaling.bind(this);
		socketIO.socket.on('webrtc-signaling', handleWebRTCSignaling);
		this.peerConnections = []; // [{ userId: Integer, socketId: string, stream: mediaStream, pc: RTCPeerConnection }]
		this.participants.forEach(p => {
			if(p.id === currentUserId) { return }
			if(!p.admitted) { return }
			p.sockets.forEach(s => {
				this.peerConnections.push({ userId: p.id, socketId: s, stream: null, pc: new RTCPeerConnection(this.configuration) });
			});
		});
		this.peerConnections.forEach(peerConnection => {
			this.registerPeerConnectionEvents(peerConnection);
		});
	}
	registerPeerConnectionEvents(peerConnection) {
		peerConnection.pc.onicecandidate = ({ candidate }) => socketIO.socket.emit('webrtc-signaling', { toSocketId: peerConnection.socketId, candidate })
		// onnegotiationneeded fired once when track is added to RTCPeerConnection
		peerConnection.pc.onnegotiationneeded = async () => {
			console.log('onnegotiationneeded');
		  try {
		    await peerConnection.pc.setLocalDescription(await peerConnection.pc.createOffer());
		    socketIO.socket.emit('webrtc-signaling', { toSocketId: peerConnection.socketId, description: peerConnection.pc.localDescription });
		  } catch (err) {
		    console.error(err);
		  }
		};
		peerConnection.pc.ontrack = event => {
			console.log('ontrack', event);
			peerConnection.stream = event.streams[0];
			this.event.emit('stream', { socketId: peerConnection.socketId }); // notify component to update srcObj
		}
	}
	participantChanges(participant, action, socketId) {
		if(this.currentUserId === participant.id) { return }
		// socketId is default to the first socket
		if(!socketId) { socketId = this.participants.find(p => p.id === participant.id).sockets[0] }
		if(action === 'UPDATE') {
			if(!this.participants.find(p => p.id === participant.id)) { this.participants = [ ...this.participants, participant ] }
			const participantToUpdate = this.participants.find(p => p.id === participant.id);
			if(participant.sockets  !== undefined) { participantToUpdate.sockets = [...participant.sockets] }
			if(participant.admitted !== undefined) { participantToUpdate.admitted = participant.admitted }
			if(!this.peerConnections.find(p => p.socketId === socketId)) {
				this.peerConnections.push({ userId: participant.id, socketId, stream: null, pc: new RTCPeerConnection(this.configuration) });
				this.registerPeerConnectionEvents(this.peerConnections.find(p => p.socketId === socketId));
			}
		}
		if(action === 'REMOVE') {
			const participantToUpdate = this.participants.find(p => p.id === participant.id);
			participantToUpdate.sockets = [...participant.sockets];
			const peerConnectionIndex = this.peerConnections.findIndex(p => p.socketId === socketId);
			this.peerConnections[peerConnectionIndex].pc.close();
			this.peerConnections.splice(peerConnectionIndex, 1);
		}
	}
	async handleWebRTCSignaling({ fromSocketId, candidate, description }) {
		console.log('handleWebRTCSignaling:', { fromSocketId, candidate, description });
		try {
			const participantIndex = this.participants.findIndex(p => {
				for(let s of p.sockets) { if(s === fromSocketId) { return true } }
				return false;
			});
			if(participantIndex === -1) { return console.log('userId not found in this.participants (id):', fromSocketId); }
			if(!this.participants[participantIndex].admitted) { return console.log('user is not admitted to the room. RTCConnection refused'); }
			const rtcPeerConnection = this.peerConnections.find(p => p.socketId === fromSocketId);
			if(!rtcPeerConnection) { return console.log('cannot find peerConnection based on socketId:', fromSocketId); }
		  if(description) {
		    // If you get an offer, you need to reply with an answer.
		    if (description.type === 'offer') {
		    	console.log('got offer: ', description);
		      await rtcPeerConnection.pc.setRemoteDescription(description);
		      window.stream = this.stream = await navigator.mediaDevices.getUserMedia(this.mediaStreamConstrains);
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

	async start() {
		try {
	    window.stream = this.stream = await navigator.mediaDevices.getUserMedia(this.mediaStreamConstrains);
	    this.peerConnections.forEach(rtcPeerConnection => {
	    	// addTrack trigger onnegotiationneeded event
	    	this.stream.getTracks().forEach((track) => rtcPeerConnection.pc.addTrack(track, this.stream));
	    });
	  } catch (err) {
	    console.error(err);
	  }
	}
	destroy() {
		this.peerConnections.forEach(rtcPeerConnection => rtcPeerConnection.pc.close());
		if(socketIO.socket) { socketIO.socket.off('webrtc-signaling', handleWebRTCSignaling) }
		if(this.stream) { this.stream.getTracks().forEach(track => track.stop()) }
	}
}