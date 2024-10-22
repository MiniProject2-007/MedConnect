// "use client";
// import React, { useRef, useEffect, useState, useCallback } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
// import { Button } from "@/components/ui/button";
// import {
//     Mic,
//     MicOff,
//     Video,
//     VideoOff,
//     Phone,
//     Share2,
//     MessageSquare,
//     NotebookPen,
//     Loader2,
//     Presentation,
// } from "lucide-react";
// import SideContent from "./SideContent";
// import Notes from "./Notes";
// import { useSocket } from "../HOC/SocketProvider";
// import peer from "@/services/peer";
// import { useRouter } from "next/navigation";
// import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
// import { addMessage } from "@/lib/redux/features/chatSlice";

// const MeetingRoom = ({ slug }) => {
//     const socket = useSocket();
//     const [remoteSocketId, setRemoteSocketId] = useState(null);
//     const [myStream, setMyStream] = useState(null);
//     const [remoteStream, setRemoteStream] = useState(null);
//     const [callStarted, setCallStarted] = useState(false);
//     const [isMuted, setIsMuted] = useState(false);
//     const [isVideoOn, setIsVideoOn] = useState(true);
//     const [isSheetOpen, setIsSheetOpen] = useState(false);
//     const messages = useAppSelector((state) => state.chat.chat);
//     const dispatch = useAppDispatch();


//     const localVideoRef = useRef();
//     const remoteVideoRef = useRef();
//     const router = useRouter();

//     // Update video refs when streams change
//     useEffect(() => {
//         if (myStream && localVideoRef.current) {
//             localVideoRef.current.srcObject = myStream;
//         }
//     }, [myStream]);

//     useEffect(() => {
//         if (remoteStream && remoteVideoRef.current) {
//             remoteVideoRef.current.srcObject = remoteStream;
//         }
//     }, [remoteStream]);

//     const handleUserJoined = useCallback(({ email, id }) => {
//         console.log(`Email ${email} joined room`);
//         setRemoteSocketId(id);
//     }, []);

//     const handleCallUser = useCallback(async () => {
//         try {
//             setCallStarted(true);
//             const stream = await navigator.mediaDevices.getUserMedia({
//                 audio: true,
//                 video: true,
//             });
//             const offer = await peer.getOffer();
//             socket.emit("user:call", { to: remoteSocketId, offer });
//             setMyStream(stream);
//             sendStreams();
//         } catch (error) {
//             console.error("Error accessing media devices:", error);
//         }
//     }, [remoteSocketId, socket]);

//     const handleIncommingCall = useCallback(
//         async ({ from, offer }) => {
//             try {
//                 setRemoteSocketId(from);
//                 const stream = await navigator.mediaDevices.getUserMedia({
//                     audio: true,
//                     video: true,
//                 });
//                 setMyStream(stream);
//                 console.log(`Incoming Call`, from, offer);
//                 const ans = await peer.getAnswer(offer);
//                 socket.emit("call:accepted", { to: from, ans });
//             } catch (error) {
//                 console.error("Error handling incoming call:", error);
//             }
//         },
//         [socket]
//     );

//     const sendStreams = useCallback(() => {
//         if (myStream) {
//             for (const track of myStream.getTracks()) {
//                 peer.peer.addTrack(track, myStream);
//             }
//         }
//     }, [myStream]);

//     const handleCallAccepted = useCallback(
//         ({ from, ans }) => {
//             peer.setLocalDescription(ans);
//             console.log("Call Accepted!");
//             sendStreams();
//         },
//         [sendStreams]
//     );

//     const handleNegoNeeded = useCallback(async () => {
//         const offer = await peer.getOffer();
//         socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
//     }, [remoteSocketId, socket]);

//     useEffect(() => {
//         peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
//         return () => {
//             peer.peer.removeEventListener(
//                 "negotiationneeded",
//                 handleNegoNeeded
//             );
//         };
//     }, [handleNegoNeeded]);

//     const handleNegoNeedIncomming = useCallback(
//         async ({ from, offer }) => {
//             const ans = await peer.getAnswer(offer);
//             socket.emit("peer:nego:done", { to: from, ans });
//         },
//         [socket]
//     );

//     const handleNegoNeedFinal = useCallback(async ({ ans }) => {
//         await peer.setLocalDescription(ans);
//     }, []);

//     useEffect(() => {
//         const handleTrack = (ev) => {
//             const remoteStream = ev.streams[0];
//             console.log("GOT TRACKS!!");
//             setRemoteStream(remoteStream);
//             document.getElementById("remote-video").srcObject = remoteStream;
//         };

//         peer.peer.addEventListener("track", handleTrack);
//         return () => {
//             peer.peer.removeEventListener("track", handleTrack);
//         };
//     }, []);

//     useEffect(() => {
//         socket.on("user:joined", handleUserJoined);
//         socket.on("incomming:call", handleIncommingCall);
//         socket.on("call:accepted", handleCallAccepted);
//         socket.on("peer:nego:needed", handleNegoNeedIncomming);
//         socket.on("peer:nego:final", handleNegoNeedFinal);

//         return () => {
//             socket.off("user:joined", handleUserJoined);
//             socket.off("incomming:call", handleIncommingCall);
//             socket.off("call:accepted", handleCallAccepted);
//             socket.off("peer:nego:needed", handleNegoNeedIncomming);
//             socket.off("peer:nego:final", handleNegoNeedFinal);
//         };
//     }, [
//         socket,
//         handleUserJoined,
//         handleIncommingCall,
//         handleCallAccepted,
//         handleNegoNeedIncomming,
//         handleNegoNeedFinal,
//     ]);
//     useEffect(() => {
//         socket.on("chat:message", (message) => {
//             dispatch(addMessage(message));
//         });

//         return () => {
//             socket.off("chat:message");
//         };
//     }, [socket, dispatch]);
//     return (
//         <div className="w-full h-screen relative">
//             <video
//                 id="remote-video"
//                 className={`w-full h-full ${!callStarted ? "hidden" : ""}`}
//                 ref={remoteVideoRef}
//                 playsInline
//                 autoPlay
//             />
//             {!remoteSocketId ? (
//                 <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200">
//                     <Loader2 className="w-12 h-12 animate-spin text-[#FF7F50]" />
//                     <p className="mt-4 text-lg text-gray-600">
//                         Waiting for participant...
//                     </p>
//                 </div>
//             ) : remoteSocketId && !callStarted ? (
//                 <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200">
//                     <button
//                         onClick={handleCallUser}
//                         className="px-4 py-2 bg-[#FF7F50] text-white rounded-lg"
//                     >
//                         Start Call
//                     </button>
//                 </div>
//             ) : (
//                 <>
//                     <div className="absolute right-4 bottom-20 h-48 w-64 bg-gray-200 rounded-lg">
//                         <video
//                             className="h-48 rounded-lg"
//                             playsInline
//                             autoPlay
//                             ref={localVideoRef}
//                             muted
//                         />
//                     </div>
//                     <Card className="absolute bottom-0 left-0 w-full">
//                         <CardContent className="p-4">
//                             <div className="flex flex-wrap justify-center gap-4">
//                                 <Button
//                                     variant="outline"
//                                     size="sm"
//                                     className="border-[#FF7F50] text-[#FF7F50] hover:bg-gray-100"
//                                     onClick={() => setIsMuted(!isMuted)}
//                                 >
//                                     {isMuted ? (
//                                         <MicOff className="w-4 h-4" />
//                                     ) : (
//                                         <Mic className="w-4 h-4" />
//                                     )}
//                                 </Button>
//                                 <Button
//                                     variant="outline"
//                                     size="sm"
//                                     className="border-[#FF7F50] text-[#FF7F50] hover:bg-gray-100"
//                                     onClick={() => setIsVideoOn(!isVideoOn)}
//                                 >
//                                     {isVideoOn ? (
//                                         <Video className="w-4 h-4" />
//                                     ) : (
//                                         <VideoOff className="w-4 h-4" />
//                                     )}
//                                 </Button>
//                                 <Button
//                                     variant="outline"
//                                     size="sm"
//                                     className="border-red-500 hover:bg-red-600 text-red-500"
//                                 >
//                                     <Phone className="w-4 h-4" />
//                                 </Button>
//                                 <Button
//                                     variant="outline"
//                                     size="sm"
//                                     className="border-[#FF7F50] text-[#FF7F50] hover:bg-gray-100"
//                                     onClick={() => {
//                                         window.open(
//                                             `/meeting/whiteboard/${slug}`
//                                         );
//                                     }}
//                                 >
//                                     <Presentation className="w-4 h-4" />
//                                 </Button>
//                                 <Sheet
//                                     open={isSheetOpen}
//                                     onOpenChange={setIsSheetOpen}
//                                 >
//                                     <SheetTrigger asChild>
//                                         <Button
//                                             variant="outline"
//                                             size="sm"
//                                             className="border-[#FF7F50] text-[#FF7F50] hover:bg-gray-100"
//                                         >
//                                             <MessageSquare className="w-4 h-4" />
//                                         </Button>
//                                     </SheetTrigger>
//                                     <SheetContent side="right">
//                                         <SideContent roomId={slug} />
//                                     </SheetContent>
//                                 </Sheet>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </>
//             )}
//         </div>
//     );
// };

// export default MeetingRoom;
"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
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
} from "lucide-react";
import SideContent from "./SideContent";
import { useSocket } from "../HOC/SocketProvider";
import peer from "@/services/peer";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { addMessage } from "@/lib/redux/features/chatSlice";

const MeetingRoom = ({ slug }) => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callStarted, setCallStarted] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const messages = useAppSelector((state) => state.chat.chat);
    const dispatch = useAppDispatch();

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const router = useRouter();

    // Handle muting/unmuting audio
    const handleToggleAudio = useCallback(() => {
        if (myStream) {
            const audioTrack = myStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    }, [myStream]);

    // Handle turning video on/off
    const handleToggleVideo = useCallback(() => {
        if (myStream) {
            const videoTrack = myStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(!isVideoOn);
            }
        }
    }, [myStream, isVideoOn]);

    // Handle ending the call
    const handleEndCall = useCallback(() => {
        if (myStream) {
            myStream.getTracks().forEach(track => track.stop());
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
        }
        peer.peer.close();
        setMyStream(null);
        setRemoteStream(null);
        setCallStarted(false);
        socket.emit("call:end", { to: remoteSocketId });
        router.push("/"); // Or wherever you want to redirect after call ends
    }, [myStream, remoteStream, remoteSocketId, socket, router]);

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

    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
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
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200">
                    <Loader2 className="w-12 h-12 animate-spin text-[#FF7F50]" />
                    <p className="mt-4 text-lg text-gray-600">
                        Waiting for participant...
                    </p>
                </div>
            ) : remoteSocketId && !callStarted ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200">
                    <button
                        onClick={handleCallUser}
                        className="px-4 py-2 bg-[#FF7F50] text-white rounded-lg"
                    >
                        Start Call
                    </button>
                </div>
            ) : (
                <>
                    <div className="absolute right-4 bottom-20 h-48 w-64 bg-gray-200 rounded-lg">
                        <video
                            className="h-48 rounded-lg"
                            playsInline
                            autoPlay
                            ref={localVideoRef}
                            muted
                        />
                    </div>
                    <Card className="absolute bottom-0 left-0 w-full">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap justify-center gap-4">
                                {/* <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-[#FF7F50] text-[#FF7F50] hover:bg-gray-100"
                                    onClick={handleToggleAudio}
                                >
                                    {isMuted ? (
                                        <MicOff className="w-4 h-4" />
                                    ) : (
                                        <Mic className="w-4 h-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-[#FF7F50] text-[#FF7F50] hover:bg-gray-100"
                                    onClick={handleToggleVideo}
                                >
                                    {isVideoOn ? (
                                        <Video className="w-4 h-4" />
                                    ) : (
                                        <VideoOff className="w-4 h-4" />
                                    )}
                                </Button> */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-500 hover:bg-red-600 text-red-500"
                                    onClick={handleEndCall}
                                >
                                    <Phone className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-[#FF7F50] text-[#FF7F50] hover:bg-gray-100"
                                    onClick={() => {
                                        window.open(`/meeting/whiteboard/${slug}`);
                                    }}
                                >
                                    <Presentation className="w-4 h-4" />
                                </Button>
                                <Sheet
                                    open={isSheetOpen}
                                    onOpenChange={setIsSheetOpen}
                                >
                                    <SheetTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-[#FF7F50] text-[#FF7F50] hover:bg-gray-100"
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
        </div>
    );
};

export default MeetingRoom;