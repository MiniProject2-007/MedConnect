class PeerService {
    constructor() {
        console.log("[PeerService] Creating new RTCPeerConnection");
        this.peer = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:global.stun.twilio.com:3478" }
            ]
        });

        // Add ICE candidate event listener
        this.peer.addEventListener("icecandidate", (event) => {
            if (event.candidate) {
                console.log("[PeerService] New ICE candidate:", event.candidate.candidate.substring(0, 50) + "...");
            } else {
                console.log("[PeerService] ICE candidate gathering complete");
            }
        });

        // Add connection state change listener
        this.peer.addEventListener("connectionstatechange", () => {
            console.log("[PeerService] Connection state changed:", this.peer.connectionState);
        });

        // Add ICE connection state change listener
        this.peer.addEventListener("iceconnectionstatechange", () => {
            console.log("[PeerService] ICE connection state changed:", this.peer.iceConnectionState);
        });

        // Add signaling state change listener
        this.peer.addEventListener("signalingstatechange", () => {
            console.log("[PeerService] Signaling state changed:", this.peer.signalingState);
        });
    }

    async getOffer() {
        console.log("[PeerService] getOffer called, signaling state:", this.peer.signalingState);
        if (this.peer.signalingState === "closed") {
            console.log("[PeerService] Peer connection is closed, cannot create offer");
            return null;
        }
        try {
            const offer = await this.peer.createOffer();
            console.log("[PeerService] Offer created:", offer.type);
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            console.log("[PeerService] Local description set");
            return offer;
        } catch (error) {
            console.error("[PeerService] Error creating offer:", error);
            return null;
        }
    }

    async getAnswer(offer) {
        console.log("[PeerService] getAnswer called, signaling state:", this.peer.signalingState);
        if (this.peer.signalingState === "closed") {
            console.log("[PeerService] Peer connection is closed, cannot create answer");
            return null;
        }
        try {
            console.log("[PeerService] Setting remote description (offer)");
            await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
            console.log("[PeerService] Remote description set, creating answer");
            const ans = await this.peer.createAnswer();
            console.log("[PeerService] Answer created:", ans.type);
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            console.log("[PeerService] Local description set");
            return ans;
        } catch (error) {
            console.error("[PeerService] Error creating answer:", error);
            return null;
        }
    }

    async setLocalDescription(ans) {
        console.log("[PeerService] setLocalDescription called, signaling state:", this.peer.signalingState);
        if (this.peer.signalingState === "closed") {
            console.log("[PeerService] Peer connection is closed, cannot set remote description");
            return;
        }
        try {
            console.log("[PeerService] Setting remote description (answer)");
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
            console.log("[PeerService] Remote description set");
        } catch (error) {
            console.error("[PeerService] Error setting remote description:", error);
        }
    }

    close() {
        console.log("[PeerService] Closing peer connection");
        if (this.peer) {
            this.peer.close();
            console.log("[PeerService] Peer connection closed, signaling state:", this.peer.signalingState);
            this.peer = null;
        }
    }
}

export default new PeerService();
