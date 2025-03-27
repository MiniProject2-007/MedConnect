import { useRef, useEffect, useState, useCallback } from "react"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  MessageSquare,
  Loader2,
  Presentation,
  Users,
  ScreenShare,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useSocket } from "../hooks/use-socket"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { addMessage } from "@/lib/redux/features/chatSlice"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import SideContent from "./side-content"

// Add console logs to createPeer function
const createPeer = () => {
  console.log("[createPeer] Creating new RTCPeerConnection")
  const peer = {
    peer: new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:global.stun.twilio.com:3478" }],
    }),

    async getOffer() {
      console.log("[createPeer] getOffer called, signaling state:", this.peer.signalingState)
      if (this.peer.signalingState === "closed") {
        console.log("[createPeer] Peer connection is closed, cannot create offer")
        return null
      }
      try {
        const offer = await this.peer.createOffer()
        console.log("[createPeer] Offer created:", offer.type)
        await this.peer.setLocalDescription(new RTCSessionDescription(offer))
        console.log("[createPeer] Local description set")
        return offer
      } catch (error) {
        console.error("[createPeer] Error creating offer:", error)
        return null
      }
    },

    async getAnswer(offer) {
      console.log("[createPeer] getAnswer called, signaling state:", this.peer.signalingState)
      if (this.peer.signalingState === "closed") {
        console.log("[createPeer] Peer connection is closed, cannot create answer")
        return null
      }
      try {
        console.log("[createPeer] Setting remote description (offer)")
        await this.peer.setRemoteDescription(new RTCSessionDescription(offer))
        console.log("[createPeer] Remote description set, creating answer")
        const answer = await this.peer.createAnswer()
        console.log("[createPeer] Answer created:", answer.type)
        await this.peer.setLocalDescription(new RTCSessionDescription(answer))
        console.log("[createPeer] Local description set")
        return answer
      } catch (error) {
        console.error("[createPeer] Error creating answer:", error)
        return null
      }
    },

    async setLocalDescription(ans) {
      console.log("[createPeer] setLocalDescription called, signaling state:", this.peer.signalingState)
      if (this.peer.signalingState === "closed") {
        console.log("[createPeer] Peer connection is closed, cannot set remote description")
        return
      }
      try {
        console.log("[createPeer] Setting remote description (answer)")
        await this.peer.setRemoteDescription(new RTCSessionDescription(ans))
        console.log("[createPeer] Remote description set")
      } catch (error) {
        console.error("[createPeer] Error setting remote description:", error)
      }
    },

    close() {
      console.log("[createPeer] Closing peer connection")
      this.peer.close()
      console.log("[createPeer] Peer connection closed, signaling state:", this.peer.signalingState)
    },
  }

  // Add ICE candidate event listener
  peer.peer.addEventListener("icecandidate", (event) => {
    if (event.candidate) {
      console.log("[createPeer] New ICE candidate:", event.candidate.candidate.substring(0, 50) + "...")
    } else {
      console.log("[createPeer] ICE candidate gathering complete")
    }
  })

  // Add connection state change listener
  peer.peer.addEventListener("connectionstatechange", () => {
    console.log("[createPeer] Connection state changed:", peer.peer.connectionState)
  })

  // Add ICE connection state change listener
  peer.peer.addEventListener("iceconnectionstatechange", () => {
    console.log("[createPeer] ICE connection state changed:", peer.peer.iceConnectionState)
  })

  // Add signaling state change listener
  peer.peer.addEventListener("signalingstatechange", () => {
    console.log("[createPeer] Signaling state changed:", peer.peer.signalingState)
  })

  return peer
}

// Add console.log at the beginning of the component
const MeetingRoom = ({ slug, doctorName = "Tanamy Shingde", doctorSpecialty = "Patient" }) => {
  console.log(`[MeetingRoom] Initializing with slug: ${slug}, doctor: ${doctorName}`)
  const socket = useSocket()
  const [remoteSocketId, setRemoteSocketId] = useState(null)
  const [myStream, setMyStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [callStarted, setCallStarted] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isRemoteAudioMuted, setIsRemoteAudioMuted] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("connecting")
  const [callDuration, setCallDuration] = useState(0)
  const [peerConnection, setPeerConnection] = useState(null)

  const messages = useAppSelector((state) => state.chat?.chat || [])
  const dispatch = useAppDispatch()
  const localVideoRef = useRef()
  const remoteVideoRef = useRef()
  const containerRef = useRef()
  const durationTimerRef = useRef(null)
  const navigate = useNavigate()

  // Initialize peer connection
  useEffect(() => {
    console.log("[MeetingRoom] Creating new peer connection")
    const newPeer = createPeer()
    setPeerConnection(newPeer)

    return () => {
      console.log("[MeetingRoom] Cleaning up peer connection")
      if (newPeer) {
        newPeer.close()
      }
    }
  }, [])

  // Add console logs to handleToggleAudio
  const handleToggleAudio = useCallback(() => {
    console.log("[MeetingRoom] Toggle audio called, current muted state:", isMuted)
    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
        console.log("[MeetingRoom] Audio track enabled set to:", audioTrack.enabled)

        socket.emit("user:audio", {
          to: remoteSocketId,
          isMuted: !audioTrack.enabled,
        })
        console.log("[MeetingRoom] Emitted user:audio event to:", remoteSocketId)
      } else {
        console.log("[MeetingRoom] No audio track found in stream")
      }
    } else {
      console.log("[MeetingRoom] No local stream available")
    }
  }, [myStream, remoteSocketId, socket, isMuted])

  // Add console logs to handleToggleVideo
  const handleToggleVideo = useCallback(() => {
    console.log("[MeetingRoom] Toggle video called, current video state:", isVideoOn)
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOn(!isVideoOn)
        console.log("[MeetingRoom] Video track enabled set to:", videoTrack.enabled)

        socket.emit("user:video", {
          to: remoteSocketId,
          isVideoOn: !isVideoOn,
        })
        console.log("[MeetingRoom] Emitted user:video event to:", remoteSocketId)
      } else {
        console.log("[MeetingRoom] No video track found in stream")
      }
    } else {
      console.log("[MeetingRoom] No local stream available")
    }
  }, [myStream, isVideoOn, remoteSocketId, socket])

  // Add console logs to handleToggleScreenShare
  const handleToggleScreenShare = useCallback(async () => {
    console.log("[MeetingRoom] Toggle screen share called, current state:", isScreenSharing)
    try {
      if (!isScreenSharing && peerConnection) {
        console.log("[MeetingRoom] Starting screen sharing")
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })
        console.log("[MeetingRoom] Screen share stream obtained:", screenStream.id)

        if (myStream) {
          const videoSender = peerConnection.peer
            .getSenders()
            .find((sender) => sender.track && sender.track.kind === "video")

          if (videoSender) {
            console.log("[MeetingRoom] Replacing video track for screen sharing")
            videoSender.replaceTrack(screenStream.getVideoTracks()[0])
          } else {
            console.log("[MeetingRoom] No video sender found to replace track")
          }

          const newStream = new MediaStream()
          myStream.getAudioTracks().forEach((track) => newStream.addTrack(track))
          screenStream.getVideoTracks().forEach((track) => newStream.addTrack(track))
          console.log("[MeetingRoom] Created combined stream with screen share")

          screenStream.getVideoTracks()[0].onended = () => {
            console.log("[MeetingRoom] Screen share ended by browser event")
            handleStopScreenShare()
          }

          setMyStream(newStream)

          // Update local video display
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = newStream
            console.log("[MeetingRoom] Updated local video with screen share stream")
          }

          setIsScreenSharing(true)
        } else {
          console.log("[MeetingRoom] No local stream available for screen sharing")
        }
      } else {
        console.log("[MeetingRoom] Stopping screen sharing")
        handleStopScreenShare()
      }
    } catch (error) {
      console.error("[MeetingRoom] Error toggling screen share:", error)
    }
  }, [isScreenSharing, myStream, peerConnection])

  // Add console logs to handleStopScreenShare
  const handleStopScreenShare = useCallback(async () => {
    console.log("[MeetingRoom] Stop screen share called")
    try {
      if (!peerConnection) {
        console.log("[MeetingRoom] No peer connection available")
        return
      }

      console.log("[MeetingRoom] Getting new camera stream")
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      console.log("[MeetingRoom] New camera stream obtained:", newStream.id)

      const videoSender = peerConnection.peer
        .getSenders()
        .find((sender) => sender.track && sender.track.kind === "video")

      if (videoSender) {
        console.log("[MeetingRoom] Replacing screen share track with camera track")
        videoSender.replaceTrack(newStream.getVideoTracks()[0])
      } else {
        console.log("[MeetingRoom] No video sender found to replace track")
      }

      const combinedStream = new MediaStream()
      if (myStream) {
        myStream.getAudioTracks().forEach((track) => {
          combinedStream.addTrack(track)
        })
        console.log("[MeetingRoom] Added audio tracks from existing stream")
      }

      newStream.getVideoTracks().forEach((track) => {
        combinedStream.addTrack(track)
      })
      console.log("[MeetingRoom] Added video tracks from new camera stream")

      setMyStream(combinedStream)

      // Update local video display
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = combinedStream
        console.log("[MeetingRoom] Updated local video with camera stream")
      }

      setIsScreenSharing(false)
    } catch (error) {
      console.error("[MeetingRoom] Error stopping screen share:", error)
    }
  }, [myStream, peerConnection])

  const handleToggleRemoteAudio = useCallback(() => {
    if (remoteStream) {
      const audioTracks = remoteStream.getAudioTracks()
      if (audioTracks.length > 0) {
        audioTracks.forEach((track) => {
          track.enabled = !track.enabled
        })
        setIsRemoteAudioMuted(!isRemoteAudioMuted)
      }
    }
  }, [remoteStream, isRemoteAudioMuted])

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Add console logs to handleEndCall
  const handleEndCall = useCallback(() => {
    console.log("[MeetingRoom] End call called")
    if (myStream) {
      console.log("[MeetingRoom] Stopping local media tracks")
      myStream.getTracks().forEach((track) => {
        track.stop()
        console.log(`[MeetingRoom] Stopped track: ${track.kind}`)
      })
    }
    if (remoteStream) {
      console.log("[MeetingRoom] Stopping remote media tracks")
      remoteStream.getTracks().forEach((track) => {
        track.stop()
        console.log(`[MeetingRoom] Stopped remote track: ${track.kind}`)
      })
    }

    if (durationTimerRef.current) {
      console.log("[MeetingRoom] Clearing duration timer")
      clearInterval(durationTimerRef.current)
    }

    if (peerConnection) {
      console.log("[MeetingRoom] Closing peer connection")
      peerConnection.close()
    }

    setMyStream(null)
    setRemoteStream(null)
    setCallStarted(false)
    setCallDuration(0)
    console.log("[MeetingRoom] Reset call state")

    console.log("[MeetingRoom] Emitting call:end event to:", remoteSocketId)
    socket.emit("call:end", { to: remoteSocketId })

    console.log("[MeetingRoom] Scheduling navigation to consultations")
    setTimeout(() => {
      navigate("/consultations")
    }, 1500)
  }, [myStream, remoteStream, remoteSocketId, socket, navigate, peerConnection])

  const handleOpenWhiteboard = useCallback(() => {
    window.open(`/meeting/whiteboard/${slug}`, "_blank", "width=1200,height=800")
  }, [slug])

  // Set local video stream
  useEffect(() => {
    if (myStream && localVideoRef.current) {
      localVideoRef.current.srcObject = myStream
    }
  }, [myStream])

  // Set remote video stream
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Call duration timer
  useEffect(() => {
    if (callStarted && !durationTimerRef.current) {
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current)
      }
    }
  }, [callStarted])

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return [
      hours > 0 ? hours.toString().padStart(2, "0") : null,
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ]
      .filter(Boolean)
      .join(":")
  }

  // Add console logs to handleUserJoined
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`[MeetingRoom] User joined: ${id}, email: ${email}`)
    setRemoteSocketId(id)
    setConnectionStatus("connected")
  }, [])

  // Add console logs to handleCallUser
  const handleCallUser = useCallback(async () => {
    console.log("[MeetingRoom] Call user called, remote socket ID:", remoteSocketId)
    if (!peerConnection) {
      console.log("[MeetingRoom] No peer connection available")
      return
    }

    try {
      setCallStarted(true)
      setConnectionStatus("connecting")
      console.log("[MeetingRoom] Set call status to connecting")

      console.log("[MeetingRoom] Requesting user media")
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      })
      console.log("[MeetingRoom] User media obtained:", stream.id)

      setMyStream(stream)
      console.log("[MeetingRoom] Set local stream")

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        console.log(`[MeetingRoom] Adding ${track.kind} track to peer connection`)
        peerConnection.peer.addTrack(track, stream)
      })

      console.log("[MeetingRoom] Creating offer")
      const offer = await peerConnection.getOffer()
      if (offer) {
        console.log("[MeetingRoom] Offer created, sending to remote peer:", remoteSocketId)
        socket.emit("user:call", { to: remoteSocketId, offer })
      } else {
        console.log("[MeetingRoom] Failed to create offer")
      }
    } catch (error) {
      console.error("[MeetingRoom] Error accessing media devices:", error)
      setConnectionStatus("disconnected")
    }
  }, [remoteSocketId, socket, peerConnection])

  // Add console logs to handleIncommingCall
  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      console.log(`[MeetingRoom] Incoming call from: ${from}`)
      if (!peerConnection) {
        console.log("[MeetingRoom] No peer connection available")
        return
      }

      try {
        setRemoteSocketId(from)
        setConnectionStatus("connecting")
        console.log("[MeetingRoom] Set connection status to connecting")

        console.log("[MeetingRoom] Requesting user media for incoming call")
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        })
        console.log("[MeetingRoom] User media obtained:", stream.id)

        setMyStream(stream)
        console.log("[MeetingRoom] Set local stream")

        // Add tracks to peer connection
        stream.getTracks().forEach((track) => {
          console.log(`[MeetingRoom] Adding ${track.kind} track to peer connection`)
          peerConnection.peer.addTrack(track, stream)
        })

        console.log("[MeetingRoom] Creating answer for offer")
        const ans = await peerConnection.getAnswer(offer)
        if (ans) {
          console.log("[MeetingRoom] Answer created, sending to caller:", from)
          socket.emit("call:accepted", { to: from, ans })
        } else {
          console.log("[MeetingRoom] Failed to create answer")
        }

        setCallStarted(true)
        console.log("[MeetingRoom] Call started")
      } catch (error) {
        console.error("[MeetingRoom] Error handling incoming call:", error)
        setConnectionStatus("disconnected")
      }
    },
    [socket, peerConnection],
  )

  // Add console logs to handleCallAccepted
  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      console.log(`[MeetingRoom] Call accepted from: ${from}`)
      if (!peerConnection) {
        console.log("[MeetingRoom] No peer connection available")
        return
      }

      console.log("[MeetingRoom] Setting remote description (answer)")
      peerConnection.setLocalDescription(ans)
      setConnectionStatus("connected")
      console.log("[MeetingRoom] Connection status set to connected")
    },
    [peerConnection],
  )

  const handleNegoNeeded = useCallback(async () => {
    console.log("[MeetingRoom] Negotiation needed")
    if (!peerConnection || !remoteSocketId) {
      console.log("[MeetingRoom] No peer connection or remote socket ID available")
      return
    }

    try {
      console.log("[MeetingRoom] Creating offer for negotiation")
      const offer = await peerConnection.getOffer()
      if (offer) {
        console.log("[MeetingRoom] Offer created, sending negotiation to:", remoteSocketId)
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId })
      } else {
        console.log("[MeetingRoom] Failed to create offer for negotiation")
      }
    } catch (error) {
      console.error("[MeetingRoom] Error in negotiation:", error)
    }
  }, [remoteSocketId, socket, peerConnection])

  // Set up negotiation needed event listener
  useEffect(() => {
    if (!peerConnection) {
      console.log("[MeetingRoom] No peer connection available for negotiation listener")
      return
    }

    const handleNegotiationNeeded = () => {
      console.log("[MeetingRoom] Negotiation needed event triggered")
      handleNegoNeeded()
    }

    console.log("[MeetingRoom] Adding negotiationneeded event listener")
    peerConnection.peer.addEventListener("negotiationneeded", handleNegotiationNeeded)

    return () => {
      console.log("[MeetingRoom] Removing negotiationneeded event listener")
      peerConnection.peer.removeEventListener("negotiationneeded", handleNegotiationNeeded)
    }
  }, [peerConnection, handleNegoNeeded])

  // Add console logs to handleNegoNeedIncomming
  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      console.log(`[MeetingRoom] Incoming negotiation from: ${from}`)
      if (!peerConnection) {
        console.log("[MeetingRoom] No peer connection available")
        return
      }

      try {
        console.log("[MeetingRoom] Creating answer for negotiation")
        const ans = await peerConnection.getAnswer(offer)
        if (ans) {
          console.log("[MeetingRoom] Answer created, sending negotiation done to:", from)
          socket.emit("peer:nego:done", { to: from, ans })
        } else {
          console.log("[MeetingRoom] Failed to create answer for negotiation")
        }
      } catch (error) {
        console.error("[MeetingRoom] Error handling incoming negotiation:", error)
      }
    },
    [socket, peerConnection],
  )

  // Add console logs to handleNegoNeedFinal
  const handleNegoNeedFinal = useCallback(
    async ({ ans }) => {
      console.log("[MeetingRoom] Final negotiation step")
      if (!peerConnection) {
        console.log("[MeetingRoom] No peer connection available")
        return
      }

      try {
        console.log("[MeetingRoom] Setting remote description (final negotiation)")
        await peerConnection.setLocalDescription(ans)
        console.log("[MeetingRoom] Remote description set successfully")
      } catch (error) {
        console.error("[MeetingRoom] Error finalizing negotiation:", error)
      }
    },
    [peerConnection],
  )

  const handleRemoteAudioChange = useCallback(({ isMuted }) => {
    // Handle remote audio change notification
    console.log("Remote audio changed:", isMuted)
  }, [])

  const handleRemoteVideoChange = useCallback(({ isVideoOn }) => {
    // Handle remote video change notification
    console.log("Remote video changed:", isVideoOn)
  }, [])

  const handleCallEnded = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop())
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop())
    }

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current)
    }

    if (peerConnection) {
      peerConnection.close()
    }

    setMyStream(null)
    setRemoteStream(null)
    setCallStarted(false)
    setCallDuration(0)
    setConnectionStatus("disconnected")

    setTimeout(() => {
      navigate("/consultations")
    }, 1500)
  }, [myStream, remoteStream, navigate, peerConnection])

  // Add console logs to track event listener
  useEffect(() => {
    if (!peerConnection) {
      console.log("[MeetingRoom] No peer connection available for track listener")
      return
    }

    const handleTrack = (ev) => {
      console.log("[MeetingRoom] Received remote track event:", ev.track?.kind)
      console.log("[MeetingRoom] Remote streams:", ev.streams?.length)
      if (ev.streams && ev.streams[0]) {
        console.log("[MeetingRoom] Setting remote stream:", ev.streams[0].id)
        setRemoteStream(ev.streams[0])
      } else {
        console.log("[MeetingRoom] No streams in track event")
      }
    }

    console.log("[MeetingRoom] Adding track event listener")
    peerConnection.peer.addEventListener("track", handleTrack)

    return () => {
      console.log("[MeetingRoom] Removing track event listener")
      peerConnection.peer.removeEventListener("track", handleTrack)
    }
  }, [peerConnection])

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) {
      console.log("[MeetingRoom] No socket available")
      return
    }

    // Join the room when component mounts
    console.log(`[MeetingRoom] Joining room: ${slug}`)
    socket.emit("room:join", { email: "User", slug })

    console.log("[MeetingRoom] Setting up socket event listeners")
    socket.on("user:joined", (data) => {
      console.log("[MeetingRoom] Socket event: user:joined", data)
      handleUserJoined(data)
    })

    socket.on("incomming:call", (data) => {
      console.log("[MeetingRoom] Socket event: incomming:call", data.from)
      handleIncommingCall(data)
    })

    socket.on("call:accepted", (data) => {
      console.log("[MeetingRoom] Socket event: call:accepted", data.from)
      handleCallAccepted(data)
    })

    socket.on("peer:nego:needed", (data) => {
      console.log("[MeetingRoom] Socket event: peer:nego:needed", data.from)
      handleNegoNeedIncomming(data)
    })

    socket.on("peer:nego:final", (data) => {
      console.log("[MeetingRoom] Socket event: peer:nego:final")
      handleNegoNeedFinal(data)
    })

    socket.on("user:audio", (data) => {
      console.log("[MeetingRoom] Socket event: user:audio", data)
      handleRemoteAudioChange(data)
    })

    socket.on("user:video", (data) => {
      console.log("[MeetingRoom] Socket event: user:video", data)
      handleRemoteVideoChange(data)
    })

    socket.on("call:end", () => {
      console.log("[MeetingRoom] Socket event: call:end")
      handleCallEnded()
    })

    socket.on("chat:message", (message) => {
      console.log("[MeetingRoom] Socket event: chat:message", message.id)
      dispatch(addMessage(message))
    })

    return () => {
      console.log("[MeetingRoom] Cleaning up socket event listeners")
      socket.off("user:joined")
      socket.off("incomming:call")
      socket.off("call:accepted")
      socket.off("peer:nego:needed")
      socket.off("peer:nego:final")
      socket.off("user:audio")
      socket.off("user:video")
      socket.off("call:end")
      socket.off("chat:message")
    }
  }, [
    socket,
    slug,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
    handleRemoteAudioChange,
    handleRemoteVideoChange,
    handleCallEnded,
    dispatch,
  ])

  // Add console logs to cleanup effect
  useEffect(() => {
    return () => {
      console.log("[MeetingRoom] Component unmounting, cleaning up resources")
      if (myStream) {
        console.log("[MeetingRoom] Stopping local media tracks")
        myStream.getTracks().forEach((track) => track.stop())
      }
      if (remoteStream) {
        console.log("[MeetingRoom] Stopping remote media tracks")
        remoteStream.getTracks().forEach((track) => track.stop())
      }
      if (durationTimerRef.current) {
        console.log("[MeetingRoom] Clearing duration timer")
        clearInterval(durationTimerRef.current)
      }
      if (peerConnection) {
        console.log("[MeetingRoom] Closing peer connection")
        peerConnection.close()
      }
    }
  }, [myStream, remoteStream, peerConnection])

  return (
    <div className="w-full h-screen relative bg-gray-100" ref={containerRef}>
      <video
        id="remote-video"
        className={`w-full h-full object-cover ${!callStarted ? "hidden" : ""}`}
        ref={remoteVideoRef}
        playsInline
        autoPlay
      />

      {connectionStatus === "connecting" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#FF7F50] mx-auto mb-4" />
            <p className="text-lg font-medium">Connecting to consultation...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we establish a secure connection</p>
          </div>
        </div>
      )}

      {!remoteSocketId && connectionStatus !== "disconnected" ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
            <div className="w-20 h-20 bg-[#FF7F50]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 animate-spin text-[#FF7F50]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Waiting for {doctorName}</h2>
            <p className="text-gray-600 mb-6">
              Your consultation will begin when the doctor joins. Please ensure your camera and microphone are working.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                className="border-[#FF7F50] text-[#FF7F50] hover:bg-[#FF7F50]/10"
                onClick={handleToggleAudio}
              >
                {isMuted ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                {isMuted ? "Unmute" : "Mute"}
              </Button>
              <Button
                variant="outline"
                className="border-[#FF7F50] text-[#FF7F50] hover:bg-[#FF7F50]/10"
                onClick={handleToggleVideo}
              >
                {isVideoOn ? <VideoOff className="mr-2 h-4 w-4" /> : <Video className="mr-2 h-4 w-4" />}
                {isVideoOn ? "Hide Camera" : "Show Camera"}
              </Button>
            </div>
          </div>
        </div>
      ) : remoteSocketId && !callStarted ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
            <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-[#FF7F50]/20">
              <AvatarImage src="/placeholder.svg?height=80&width=80" alt={doctorName} />
              <AvatarFallback className="bg-[#FF7F50]/10 text-[#FF7F50] text-xl">
                {doctorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{doctorName}</h2>
            <p className="text-[#FF7F50] font-medium mb-4">{doctorSpecialty}</p>
            <p className="text-gray-600 mb-6">
              Your doctor is ready for the consultation. Click the button below to join.
            </p>
            <Button
              onClick={handleCallUser}
              className="bg-[#FF7F50] hover:bg-[#FF6347] text-white px-8 py-2 rounded-full"
            >
              <Video className="mr-2 h-4 w-4" />
              Start Consultation
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <Badge variant="outline" className="bg-black/30 text-white border-none px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              {formatDuration(callDuration)}
            </Badge>

            {connectionStatus === "connected" && (
              <Badge variant="outline" className="bg-black/30 text-white border-none px-3 py-1">
                <Users className="w-3 h-3 mr-1" />2 Participants
              </Badge>
            )}
          </div>

          <div className="absolute right-4 bottom-24 h-48 w-64 rounded-lg overflow-hidden border-2 border-white shadow-lg z-20">
            <video className="h-full w-full object-cover" playsInline autoPlay ref={localVideoRef} muted />
            <div className="absolute bottom-2 right-2">
              <Badge variant="outline" className="bg-black/50 text-white border-none text-xs">
                You {isMuted && "(Muted)"}
              </Badge>
            </div>
          </div>

          <Card className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-sm border-t border-gray-200 z-30">
            <CardContent className="p-4">
              <div className="flex flex-wrap justify-center gap-3">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`rounded-full h-12 w-12 ${isMuted ? "bg-red-50 border-red-200 text-red-500" : "border-[#FF7F50] text-[#FF7F50]"}`}
                        onClick={handleToggleAudio}
                      >
                        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isMuted ? "Unmute microphone" : "Mute microphone"}</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`rounded-full h-12 w-12 ${!isVideoOn ? "bg-red-50 border-red-200 text-red-500" : "border-[#FF7F50] text-[#FF7F50]"}`}
                        onClick={handleToggleVideo}
                      >
                        {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isVideoOn ? "Turn off camera" : "Turn on camera"}</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`rounded-full h-12 w-12 ${isScreenSharing ? "bg-[#FF7F50]/20 border-[#FF7F50] text-[#FF7F50]" : "border-[#FF7F50] text-[#FF7F50]"}`}
                        onClick={handleToggleScreenShare}
                      >
                        <ScreenShare className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isScreenSharing ? "Stop screen sharing" : "Share your screen"}</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-12 w-12 border-[#FF7F50] text-[#FF7F50]"
                        onClick={handleOpenWhiteboard}
                      >
                        <Presentation className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Open interactive whiteboard</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="rounded-full h-12 w-12"
                        onClick={handleEndCall}
                      >
                        <Phone className="h-5 w-5 rotate-135" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>End consultation</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`rounded-full h-12 w-12 ${isRemoteAudioMuted ? "bg-red-50 border-red-200 text-red-500" : "border-[#FF7F50] text-[#FF7F50]"}`}
                        onClick={handleToggleRemoteAudio}
                      >
                        {isRemoteAudioMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isRemoteAudioMuted ? "Unmute participant" : "Mute participant"}</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-12 w-12 border-[#FF7F50] text-[#FF7F50]"
                        onClick={handleToggleFullscreen}
                      >
                        {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}</TooltipContent>
                  </Tooltip>

                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SheetTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-12 w-12 border-[#FF7F50] text-[#FF7F50]"
                          >
                            <MessageSquare className="h-5 w-5" />
                          </Button>
                        </SheetTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Open chat and files</TooltipContent>
                    </Tooltip>
                    <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
                      <SideContent roomId={slug} />
                    </SheetContent>
                  </Sheet>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default MeetingRoom

