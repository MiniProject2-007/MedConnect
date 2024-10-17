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
// } from "lucide-react";
// import SideContent from "./SideContent";
// import Notes from "./Notes";
// import { useSocket } from "../HOC/SocketProvider";
// import peer from "@/services/peer";

// const MeetingRoom = ({ slug }) => {
//     const socket = useSocket();
//     const [isSheetOpen, setIsSheetOpen] = useState(false);
//     const [isMuted, setIsMuted] = useState(false);
//     const [isVideoOn, setIsVideoOn] = useState(true);
//     const remoteVideoRef = useRef();
//     const localVideoRef = useRef();
//     const [myStream, setMyStream] = useState(null);
//     const [remoteStream, setRemoteStream] = useState(null);
//     const [remoteSocketId, setRemoteSocketId] = useState(null);

//     const handleUserJoined = useCallback(({ email, id }) => {
//         console.log(`Email ${email} joined room`);
//         setRemoteSocketId(id);
//     }, []);

//     const handleCallUser = useCallback(async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({
//                 audio: true,
//                 video: true,
//             });

//             setMyStream(stream);
//             localVideoRef.current.srcObject = stream;

//             // Only create offer if connection state is stable
//             if (peer.peer.connectionState === "stable") {
//                 const offer = await peer.getOffer();
//                 socket.emit("user:call", { to: remoteSocketId, offer });
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }, [remoteSocketId, socket]);

//     const handleIncommingCall = useCallback(
//         async ({ from, offer }) => {
//             console.log("handleIncommingCall", from, offer);
//             setRemoteSocketId(from);
//             try {
//                 const stream = await navigator.mediaDevices.getUserMedia({
//                     audio: true,
//                     video: true,
//                 });
//                 setMyStream(stream);
//                 localVideoRef.current.srcObject = stream;
//             } catch (error) {
//                 console.log(error);
//             }
//             console.log(`Incoming Call`, from, offer);
//             const ans = await peer.getAnswer(offer);
//             socket.emit("call:accepted", { to: from, ans });
//         },
//         [socket]
//     );

//     const sendStreams = useCallback(() => {
//         for (const track of myStream.getTracks()) {
//             console.log("Adding Track", track);
//             peer.peer.addTrack(track, myStream);
//         }
//         console.log("Sending Streams");
//     }, [myStream]);

//     const handleCallAccepted = useCallback(
//         ({ from, ans }) => {
//             peer.setLocalDescription(ans);
//             console.log("Call Accepted!");
//             sendStreams();
//         },
//         [sendStreams]
//     );

//     const handleTrack = useCallback((ev) => {
//         const remoteStream = ev.streams[0];
//         console.log("GOT TRACKS!!", remoteStream);
//         setRemoteStream(remoteStream);
//     }, []);

//     useEffect(() => {
//         peer.peer.addEventListener("track", handleTrack);
//         return () => {
//             peer.peer.removeEventListener("track", handleTrack);
//         };
//     }, [handleTrack]);

//     useEffect(() => {
//         if (remoteStream && remoteVideoRef.current) {
//             remoteVideoRef.current.srcObject = remoteStream;
//         }
//     }, [remoteStream]);

//     const handleNegoNeeded = useCallback(async () => {
//         // Only trigger negotiation when the connection is stable
//         if (peer.peer.connectionState === "stable") {
//             const offer = await peer.getOffer();
//             socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
//         }
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
//         // Set the remote answer when negotiation is completed
//         if (peer.peer.signalingState === "have-local-offer") {
//             await peer.setLocalDescription(ans);
//         }
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
//         if (remoteSocketId) {
//             try {
//                 navigator.mediaDevices
//                     .getUserMedia({
//                         video: true,
//                         audio: true,
//                     })
//                     .then((stream) => {
//                         setMyStream(stream);
//                         localVideoRef.current.srcObject = stream;
//                     });
//             } catch (err) {
//                 console.log(err);
//             }
//         }
//     }, [remoteSocketId]);

//     useEffect(() => {
//         if (remoteSocketId) {
//             handleCallUser();
//         }
//     }, [remoteSocketId]);
//     if (!remoteSocketId) {
//         return (
//             <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-200">
//                 <Loader2 className="w-12 h-12 animate-spin text-[#FF7F50]" />
//                 <p className="mt-4 text-lg text-gray-600">
//                     Waiting for participant...
//                 </p>
//             </div>
//         );
//     }
//     return (
//         <div className="w-full h-screen relative">
//             <video
//                 id="remote-video"
//                 className="w-full h-full"
//                 ref={remoteVideoRef}
//                 playsInline
//                 autoPlay
//             />
//             <div className="absolute right-4 bottom-20 h-48 w-64 bg-gray-200 rounded-lg">
//                 <video
//                     className="h-48 rounded-lg"
//                     playsInline
//                     autoPlay
//                     ref={localVideoRef}
//                 />
//             </div>
//             <Card className="absolute bottom-0 left-0 w-full">
//                 <CardContent className="p-4">
//                     <div className="flex flex-wrap justify-center gap-4">
//                         <Button
//                             variant="outline"
//                             size="sm"
//                             className="border-[#FF7F50] text-[#FF7F50] hover:bg-gray-100"
//                             onClick={() => setIsMuted(!isMuted)}
//                         >
//                             {isMuted ? (
//                                 <MicOff className="w-4 h-4" />
//                             ) : (
//                                 <Mic className="w-4 h-4" />
//                             )}
//                         </Button>
//                         <Button
//                             variant="outline"
//                             size="sm"
//                             className="border-[#FF7F50] text-[#FF7F50] hover:bg-gray-100"
//                             onClick={() => setIsVideoOn(!isVideoOn)}
//                         >
//                             {isVideoOn ? (
//                                 <Video className="w-4 h-4" />
//                             ) : (
//                                 <VideoOff className="w-4 h-4" />
//                             )}
//                         </Button>
//                         <Button
//                             variant="outline"
//                             size="sm"
//                             className="border-red-500 hover:bg-red-600 text-red-500"
//                         >
//                             <Phone className="w-4 h-4" />
//                         </Button>
//                         <Button
//                             variant="outline"
//                             size="sm"
//                             className="border-[#FF7F50] text-[#FF7F50] hover:bg-gray-100"
//                         >
//                             <Share2 className="w-4 h-4" />
//                         </Button>
//                         <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
//                             <SheetTrigger asChild>
//                                 <Button
//                                     variant="outline"
//                                     size="sm"
//                                     className="border-[#FF7F50] text-[#FF7F50] hover:bg-gray-100"
//                                 >
//                                     <MessageSquare className="w-4 h-4" />
//                                 </Button>
//                             </SheetTrigger>
//                             <SheetContent side="right">
//                                 <SideContent />
//                             </SheetContent>
//                         </Sheet>
//                         <Drawer>
//                             <DrawerTrigger asChild>
//                                 <Button
//                                     variant="outline"
//                                     size="sm"
//                                     className="border-[#FF7F50] text-[#FF7F50] hover:bg-gray-100"
//                                 >
//                                     <NotebookPen className="w-4 h-4" />
//                                 </Button>
//                             </DrawerTrigger>
//                             <DrawerContent>
//                                 <Notes />
//                             </DrawerContent>
//                         </Drawer>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };

// export default MeetingRoom;
"use client";
import React, { useEffect, useCallback, useState, useRef } from "react";
import peer from "@/services/peer";
import { useSocket } from "../HOC/SocketProvider";

const RoomPage = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState();
    const [remoteStream, setRemoteStream] = useState();
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();

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

    // Start call automatically when user joins
    useEffect(() => {
        if (remoteSocketId) {
            // Automatically start the call when a remote user is present
            handleCallUser();
        }
    }, [remoteSocketId]);

    const handleCallUser = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            setMyStream(stream);

            const offer = await peer.getOffer();
            socket.emit("user:call", { to: remoteSocketId, offer });
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

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Room Page</h1>
            <h4 className="text-lg mb-4">
                {remoteSocketId ? "Connected" : "No one in room"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myStream && (
                    <div>
                        <h2 className="text-xl font-semibold mb-2">
                            My Stream
                        </h2>
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full max-w-md border rounded"
                        />
                    </div>
                )}

                {remoteStream && (
                    <div>
                        <h2 className="text-xl font-semibold mb-2">
                            Remote Stream
                        </h2>
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full max-w-md border rounded"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomPage;
