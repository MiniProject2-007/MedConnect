import React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Phone,
    MessageSquare,
    Loader2,
    Presentation,
    Clock,
    ScreenShare,
    RepeatIcon,
    StopCircle,
} from "lucide-react";
import { useSocket } from "../hooks/use-socket";
import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import SideContent from "./side-content";
import peer from "../services/peer";
import { addMessage } from "@/lib/redux/features/chatSlice";
import { useAudioRecorder } from "../hooks/use-audio-recorder";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

const MeetingRoom = () => {
    const { id: slug } = useParams();
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callStarted, setCallStarted] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [meetingDuration, setMeetingDuration] = useState(0);
    const [meetingStartTime, setMeetingStartTime] = useState(null);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const messages = useAppSelector((state) => state.chat.chat);
    const dispatch = useAppDispatch();
    const {
        isRecording,
        startRecording,
        stopRecording,
        recordingTime,
        recordingStatus,
    } = useAudioRecorder(slug);

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const navigate = useNavigate();
    const durationTimerRef = useRef(null);

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return [
            hours > 0 ? String(hours).padStart(2, "0") : null,
            String(minutes).padStart(2, "0"),
            String(secs).padStart(2, "0"),
        ]
            .filter(Boolean)
            .join(":");
    };

    // Start meeting timer when call starts
    useEffect(() => {
        if (callStarted && !meetingStartTime) {
            setMeetingStartTime(Date.now());

            durationTimerRef.current = setInterval(() => {
                setMeetingDuration((prev) => prev + 1);
            }, 1000);
        }

        return () => {
            if (durationTimerRef.current) {
                clearInterval(durationTimerRef.current);
            }
        };
    }, [callStarted, meetingStartTime]);

    const handleToggleAudio = useCallback(() => {
        if (myStream) {
            const audioTrack = myStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);

                // Notify other participants about mute status
                socket.emit("user:audio:toggle", {
                    to: remoteSocketId,
                    isMuted: !audioTrack.enabled,
                });
            }
        }
    }, [myStream, remoteSocketId, socket]);

    const handleToggleVideo = useCallback(() => {
        if (myStream) {
            const videoTrack = myStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(!isVideoOn);

                // Notify other participants about video status
                socket.emit("user:video:toggle", {
                    to: remoteSocketId,
                    isVideoOff: isVideoOn,
                });
            }
        }
    }, [myStream, isVideoOn, remoteSocketId, socket]);

    const handleEndCall = useCallback(() => {
        if (isRecording) {
            stopRecording();
        }

        if (myStream) {
            myStream.getTracks().forEach((track) => track.stop());
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach((track) => track.stop());
        }
        peer.peer.close();
        setMyStream(null);
        setRemoteStream(null);
        setCallStarted(false);

        // Clear meeting timer
        if (durationTimerRef.current) {
            clearInterval(durationTimerRef.current);
            durationTimerRef.current = null;
        }

        socket.emit("call:end", { to: remoteSocketId });
        navigate("/dashboard"); // Or wherever you want to redirect after call ends
    }, [
        myStream,
        remoteStream,
        remoteSocketId,
        socket,
        navigate,
        isRecording,
        stopRecording,
    ]);

    // Update video refs when streams change
    useEffect(() => {
        if (myStream && localVideoRef.current) {
            localVideoRef.current.srcObject = myStream;
        }
    }, [myStream]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    }, []);

    const handleCallUser = useCallback(async () => {
        try {
            setCallStarted(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            const offer = await peer.getOffer();
            socket.emit("user:call", { to: remoteSocketId, offer });
            setMyStream(stream);
            sendStreams();
        } catch (error) {
            console.error("Error accessing media devices:", error);
        }
    }, [remoteSocketId, socket]);

    const handleIncommingCall = useCallback(
        async ({ from, offer }) => {
            try {
                setRemoteSocketId(from);
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true,
                });
                setMyStream(stream);
                console.log(`Incoming Call`, from, offer);
                const ans = await peer.getAnswer(offer);
                socket.emit("call:accepted", { to: from, ans });
            } catch (error) {
                console.error("Error handling incoming call:", error);
            }
        },
        [socket]
    );

    const sendStreams = useCallback(() => {
        if (myStream) {
            for (const track of myStream.getTracks()) {
                peer.peer.addTrack(track, myStream);
            }
        }
    }, [myStream]);

    const handleCallAccepted = useCallback(
        ({ from, ans }) => {
            peer.setLocalDescription(ans);
            console.log("Call Accepted!");
            sendStreams();
        },
        [sendStreams]
    );

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    const handleScreenShare = useCallback(async () => {
        try {
            if (isScreenSharing) {
                setIsScreenSharing(false);
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true,
                });
                const videoTrack = stream.getVideoTracks()[0];
                const sender = peer.peer.getSenders().find((s) => {
                    return s.track.kind === videoTrack.kind;
                });
                if (sender) {
                    sender.replaceTrack(videoTrack);
                } else {
                    peer.peer.addTrack(videoTrack, stream);
                }
            } else {
                const stream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true,
                });
                const screenTrack = stream.getVideoTracks()[0];
                const sender = peer.peer.getSenders().find((s) => {
                    return s.track.kind === screenTrack.kind;
                });
                if (sender) {
                    sender.replaceTrack(screenTrack);
                } else {
                    peer.peer.addTrack(screenTrack, stream);
                }
                setIsScreenSharing(true);
            }
        } catch (error) {
            console.error("Error sharing screen:", error);
        }
    }, [isScreenSharing]);

    const handleToggleRecording = useCallback(() => {
        if (isRecording) {
            stopRecording();
            toast({
                title: "Recording stopped",
                description: "Your recording has been saved",
            });
        } else {
            startRecording();
            toast({
                title: "Recording started",
                description: "Recording continuously in 1-minute chunks",
            });
        }
    }, [isRecording, startRecording, stopRecording]);

    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener(
                "negotiationneeded",
                handleNegoNeeded
            );
        };
    }, [handleNegoNeeded]);

    const handleNegoNeedIncomming = useCallback(
        async ({ from, offer }) => {
            const ans = await peer.getAnswer(offer);
            socket.emit("peer:nego:done", { to: from, ans });
        },
        [socket]
    );

    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, []);

    useEffect(() => {
        const handleTrack = (ev) => {
            const remoteStream = ev.streams[0];
            console.log("GOT TRACKS!!");
            setRemoteStream(remoteStream);
            document.getElementById("remote-video").srcObject = remoteStream;
        };

        peer.peer.addEventListener("track", handleTrack);
        return () => {
            peer.peer.removeEventListener("track", handleTrack);
        };
    }, []);

    useEffect(() => {
        socket.on("user:joined", handleUserJoined);
        socket.on("incomming:call", handleIncommingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoNeedIncomming);
        socket.on("peer:nego:final", handleNegoNeedFinal);

        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off("incomming:call", handleIncommingCall);
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed", handleNegoNeedIncomming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
        };
    }, [
        socket,
        handleUserJoined,
        handleIncommingCall,
        handleCallAccepted,
        handleNegoNeedIncomming,
        handleNegoNeedFinal,
    ]);

    useEffect(() => {
        socket.on("chat:message", (message) => {
            dispatch(addMessage(message));
        });

        return () => {
            socket.off("chat:message");
        };
    }, [socket, dispatch]);

    return (
        <div className="w-full h-screen relative">
            <video
                id="remote-video"
                className={`w-full h-full ${!callStarted ? "hidden" : ""}`}
                ref={remoteVideoRef}
                playsInline
                autoPlay
            />
            {!remoteSocketId ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="mt-4 text-lg font-medium">
                        Waiting for participant to join...
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Share the meeting link to invite someone
                    </p>
                </div>
            ) : remoteSocketId && !callStarted ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold">Ready to join?</h2>
                        <p className="text-muted-foreground">
                            Participant is waiting for you
                        </p>
                    </div>
                    <Button
                        onClick={handleCallUser}
                        className="px-6 py-2 rounded-full bg-primary hover:bg-primary/90 text-white"
                    >
                        Start Call
                    </Button>
                </div>
            ) : (
                <>
                    <div className="absolute right-4 bottom-20 h-48 w-64 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                        {isVideoOn ? (
                            <video
                                className="h-full w-full object-cover rounded-lg"
                                playsInline
                                autoPlay
                                ref={localVideoRef}
                                muted
                            />
                        ) : (
                            <div className="h-full w-full bg-gray-800 flex items-center justify-center rounded-lg">
                                <div className="bg-gray-700 rounded-full p-6">
                                    <VideoOff className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-2 left-2 flex gap-2">
                            {isMuted && (
                                <div className="bg-red-500 rounded-full p-1">
                                    <MicOff className="w-3 h-3 text-white" />
                                </div>
                            )}
                            {!isVideoOn && (
                                <div className="bg-red-500 rounded-full p-1">
                                    <VideoOff className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                    <Card className="absolute bottom-0 left-0 w-full">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap justify-center gap-4">
                                <div className="relative group">
                                    <Button
                                        variant={
                                            isMuted ? "destructive" : "outline"
                                        }
                                        size="icon"
                                        className={`rounded-full w-10 h-10 ${
                                            isMuted
                                                ? ""
                                                : "border-[] hover:bg-gray-100"
                                        }`}
                                        onClick={handleToggleAudio}
                                    >
                                        {isMuted ? (
                                            <MicOff className="w-5 h-5" />
                                        ) : (
                                            <Mic className="w-5 h-5" />
                                        )}
                                    </Button>
                                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {isMuted ? "Unmute" : "Mute"}
                                    </div>
                                </div>
                                <div className="relative group">
                                    <Button
                                        variant={
                                            isVideoOn
                                                ? "outline"
                                                : "destructive"
                                        }
                                        size="icon"
                                        className={`rounded-full w-10 h-10 ${
                                            isVideoOn
                                                ? "border-[] hover:bg-gray-100"
                                                : ""
                                        }`}
                                        onClick={handleToggleVideo}
                                    >
                                        {isVideoOn ? (
                                            <Video className="w-5 h-5" />
                                        ) : (
                                            <VideoOff className="w-5 h-5" />
                                        )}
                                    </Button>
                                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {isVideoOn
                                            ? "Turn off camera"
                                            : "Turn on camera"}
                                    </div>
                                </div>
                                <div className="relative group">
                                    <Button
                                        variant={
                                            isRecording
                                                ? "destructive"
                                                : "outline"
                                        }
                                        size="icon"
                                        className={`rounded-full w-10 h-10 ${
                                            isRecording
                                                ? ""
                                                : "border-[] hover:bg-gray-100"
                                        }`}
                                        onClick={handleToggleRecording}
                                    >
                                        {isRecording ? (
                                            <StopCircle className="w-5 h-5" />
                                        ) : (
                                            <RepeatIcon className="w-5 h-5" />
                                        )}
                                    </Button>
                                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {isRecording
                                            ? "Stop recording"
                                            : "Start recording"}
                                    </div>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="rounded-full w-10 h-10"
                                    onClick={handleEndCall}
                                >
                                    <Phone className="w-5 h-5 rotate-135" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full w-10 h-10 border-[] hover:bg-gray-100"
                                    onClick={() => {
                                        window.open(
                                            `${import.meta.env.VITE_WHITEBOARD_URL}${slug}`,
                                            "_blank"
                                        );
                                    }}
                                >
                                    <Presentation className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full w-10 h-10 border-[] hover:bg-gray-100"
                                    onClick={handleScreenShare}
                                >
                                    <ScreenShare className="w-5 h-5" />
                                </Button>
                                <Sheet
                                    open={isSheetOpen}
                                    onOpenChange={setIsSheetOpen}
                                >
                                    <SheetTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-[] hover:bg-gray-100"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right">
                                        <SideContent roomId={slug} />
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
            {callStarted && (
                <>
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Connected
                    </div>
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(meetingDuration)}</span>
                    </div>
                    {isRecording && (
                        <div className="absolute top-16 right-4">
                            <Badge
                                variant="destructive"
                                className="text-white flex items-center gap-2 px-3 py-1"
                            >
                                <div className="text-white w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                Recording {formatDuration(recordingTime)}
                                {recordingStatus && (
                                    <span className="text-xs">
                                        ({recordingStatus})
                                    </span>
                                )}
                            </Badge>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MeetingRoom;
