import React from "react"
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


const createPeer = () => {
  const peer = {
    peer: new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:global.stun.twilio.com:3478" }],
    }),

    async getOffer() {
      const offer = await this.peer.createOffer()
      await this.peer.setLocalDescription(offer)
      return offer
    },

    async getAnswer(offer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await this.peer.createAnswer()
      await this.peer.setLocalDescription(answer)
      return answer
    },

    async setLocalDescription(ans) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans))
    },

    close() {
      this.peer.close()
    },
  }

  return peer
}

const peer = createPeer()

const MeetingRoom = ({ slug, doctorName = "Tanamy Shingde", doctorSpecialty = "Patient" }) => {
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

  const messages = useAppSelector((state) => state.chat?.chat || [])
  const dispatch = useAppDispatch()
  const localVideoRef = useRef()
  const remoteVideoRef = useRef()
  const containerRef = useRef()
  const durationTimerRef = useRef(null)
  const navigate = useNavigate()

  const handleToggleAudio = useCallback(() => {
    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)

        socket.emit("user:audio", {
          to: remoteSocketId,
          isMuted: !audioTrack.enabled,
        })
      }
    }
  }, [myStream, remoteSocketId, socket])

  const handleToggleVideo = useCallback(() => {
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOn(!isVideoOn)

        socket.emit("user:video", {
          to: remoteSocketId,
          isVideoOn: !isVideoOn,
        })
      }
    }
  }, [myStream, isVideoOn, remoteSocketId, socket])

  const handleToggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })

        if (myStream && peer.peer) {
          const videoSender = peer.peer.getSenders().find((sender) => sender.track && sender.track.kind === "video")

          if (videoSender) {
            videoSender.replaceTrack(screenStream.getVideoTracks()[0])
          }

          const newStream = new MediaStream()
          myStream.getAudioTracks().forEach((track) => newStream.addTrack(track))
          screenStream.getVideoTracks().forEach((track) => newStream.addTrack(track))

          screenStream.getVideoTracks()[0].onended = () => {
            handleStopScreenShare()
          }

          setMyStream(newStream)
          setIsScreenSharing(true)
        }
      } else {
        handleStopScreenShare()
      }
    } catch (error) {
      console.error("Error toggling screen share:", error)
    }
  }, [isScreenSharing, myStream])

  const handleStopScreenShare = useCallback(async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      if (peer.peer) {
        const videoSender = peer.peer.getSenders().find((sender) => sender.track && sender.track.kind === "video")

        if (videoSender) {
          videoSender.replaceTrack(newStream.getVideoTracks()[0])
        }

        const combinedStream = new MediaStream()
        myStream.getAudioTracks().forEach((track) => {
          combinedStream.addTrack(track)
        })
        newStream.getVideoTracks().forEach((track) => {
          combinedStream.addTrack(track)
        })

        setMyStream(combinedStream)
        setIsScreenSharing(false)
      }
    } catch (error) {
      console.error("Error stopping screen share:", error)
    }
  }, [myStream])

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

  const handleEndCall = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop())
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop())
    }

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current)
    }

    if (peer.peer) {
      peer.close()
    }

    setMyStream(null)
    setRemoteStream(null)
    setCallStarted(false)
    setCallDuration(0)

    socket.emit("call:end", { to: remoteSocketId })

    setTimeout(() => {
      navigate("/consultations")
    }, 1500)
  }, [myStream, remoteStream, remoteSocketId, socket, navigate])

  const handleOpenWhiteboard = useCallback(() => {
    window.open(`/meeting/whiteboard/${slug}`, "_blank", "width=1200,height=800")
  }, [slug])

  useEffect(() => {
    if (myStream && localVideoRef.current) {
      localVideoRef.current.srcObject = myStream
    }
  }, [myStream])

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

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

  const handleUserJoined = useCallback(({ email, id }) => {
    setRemoteSocketId(id)
    setConnectionStatus("connected")
  }, [])

  const handleCallUser = useCallback(async () => {
    try {
      setCallStarted(true)
      setConnectionStatus("connecting")

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      })

      const offer = await peer.getOffer()
      socket.emit("user:call", { to: remoteSocketId, offer })
      setMyStream(stream)
    } catch (error) {
      console.error("Error accessing media devices:", error)
      setConnectionStatus("disconnected")
    }
  }, [remoteSocketId, socket])

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      try {
        setRemoteSocketId(from)
        setConnectionStatus("connecting")

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        })

        setMyStream(stream)

        const ans = await peer.getAnswer(offer)
        socket.emit("call:accepted", { to: from, ans })

        setCallStarted(true)
      } catch (error) {
        console.error("Error handling incoming call:", error)
        setConnectionStatus("disconnected")
      }
    },
    [socket],
  )

  const sendStreams = useCallback(() => {
    if (myStream) {
      for (const track of myStream.getTracks()) {
        peer.peer.addTrack(track, myStream)
      }
    }
  }, [myStream])

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans)
      sendStreams()
      setConnectionStatus("connected")
    },
    [sendStreams],
  )

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer()
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId })
  }, [remoteSocketId, socket])

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded)
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded)
    }
  }, [handleNegoNeeded])

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer)
      socket.emit("peer:nego:done", { to: from, ans })
    },
    [socket],
  )

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans)
  }, [])

  const handleRemoteAudioChange = useCallback(({ isMuted }) => {}, [])
  const handleRemoteVideoChange = useCallback(({ isVideoOn }) => {}, [])

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

    setMyStream(null)
    setRemoteStream(null)
    setCallStarted(false)
    setCallDuration(0)
    setConnectionStatus("disconnected")

    setTimeout(() => {
      navigate("/consultations")
    }, 1500)
  }, [myStream, remoteStream, navigate])

  useEffect(() => {
    const handleTrack = (ev) => {
      const remoteStream = ev.streams[0]
      setRemoteStream(remoteStream)

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
      }
    }

    peer.peer.addEventListener("track", handleTrack)
    return () => {
      peer.peer.removeEventListener("track", handleTrack)
    }
  }, [])

  useEffect(() => {
    socket.on("user:joined", handleUserJoined)
    socket.on("incomming:call", handleIncommingCall)
    socket.on("call:accepted", handleCallAccepted)
    socket.on("peer:nego:needed", handleNegoNeedIncomming)
    socket.on("peer:nego:final", handleNegoNeedFinal)
    socket.on("user:audio", handleRemoteAudioChange)
    socket.on("user:video", handleRemoteVideoChange)
    socket.on("call:end", handleCallEnded)
    socket.on("chat:message", (message) => {
      dispatch(addMessage(message))
    })

    return () => {
      socket.off("user:joined", handleUserJoined)
      socket.off("incomming:call", handleIncommingCall)
      socket.off("call:accepted", handleCallAccepted)
      socket.off("peer:nego:needed", handleNegoNeedIncomming)
      socket.off("peer:nego:final", handleNegoNeedFinal)
      socket.off("user:audio", handleRemoteAudioChange)
      socket.off("user:video", handleRemoteVideoChange)
      socket.off("call:end", handleCallEnded)
      socket.off("chat:message")
    }
  }, [
    socket,
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

