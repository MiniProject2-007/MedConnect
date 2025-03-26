import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, Mic, MicOff, VideoOff, Phone, User } from "lucide-react";
import { useSocket } from "../hooks/use-socket";
import { useUser } from "@clerk/clerk-react";
import { useParams } from "react-router-dom";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const JoinMeeting = () => {
    const { id } = useParams();
    const [isMicOn, setIsMicOn] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const socket = useSocket();
    const { slug } = useParams();

    const videoRef = useRef(null);
    const toggleMic = () => setIsMicOn(!isMicOn);

    const toggleVideo = () => {
        if (isVideoOn) {
            stopCamera();
        } else {
            startCamera();
        }
        setIsVideoOn(!isVideoOn);
    };

    const startCamera = () => {
        try {
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    setLocalStream(stream);
                    videoRef.current.srcObject = stream;
                })
                .catch((err) => {
                    console.error(err);
                });
        } catch (err) {
            console.error(err);
        }
    };

    const stopCamera = () => {
        if (localStream && localStream.getVideoTracks().length > 0) {
            localStream.getVideoTracks()[0].stop();
        }
    };

    const handleJoinMeeting = (e) => {
        e.preventDefault();
        socket.emit("room:join", { slug, email });
    };

    useEffect(() => {
        socket.on("room:join", (data) => {
            const { email, room } = data;
            router.push(`/meeting/live/${slug}`);
        });

        return () => {
            if (localStream) {
                localStream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [socket, localStream]);

    return (
        <div className=" flex items-center justify-center py-10 px-4">
            <Card className="w-full max-w-xl shadow-sm border-0">
                <CardHeader className="bg-primary text-primary-foreground rounded-t-lg pb-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Join Meeting</h1>
                        <Badge
                            variant="outline"
                            className="bg-primary-foreground/10 text-primary-foreground px-3 py-1 font-medium"
                        >
                            ID: {id}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="relative aspect-video bg-gray-900 overflow-hidden">
                        {isVideoOn ? (
                            <video
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                playsInline
                                ref={videoRef}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white">
                                <div className="h-20 w-20 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                                    <User size={40} className="text-gray-400" />
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Camera is turned off
                                </p>
                            </div>
                        )}

                        {/* Status indicator */}
                        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                            <div
                                className={`flex items-center ${
                                    isMicOn ? "text-green-400" : "text-red-400"
                                } bg-black/50 px-2 py-1 rounded-full text-xs`}
                            >
                                {isMicOn ? (
                                    <Mic size={12} className="mr-1" />
                                ) : (
                                    <MicOff size={12} className="mr-1" />
                                )}
                                <span>{isMicOn ? "Mic on" : "Mic off"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <p className="text-sm text-gray-500 mb-4 text-center">
                            You can adjust your audio and video settings before
                            joining
                        </p>

                        <div className="flex justify-center space-x-6">
                            <div className="flex flex-col items-center">
                                <Button
                                    type="button"
                                    variant={
                                        isMicOn ? "outline" : "destructive"
                                    }
                                    size="icon"
                                    className="h-14 w-14 rounded-full"
                                    onClick={toggleMic}
                                >
                                    {isMicOn ? (
                                        <Mic className="h-6 w-6" />
                                    ) : (
                                        <MicOff className="h-6 w-6" />
                                    )}
                                </Button>
                                <span className="text-xs mt-2">
                                    {isMicOn ? "Mute" : "Unmute"}
                                </span>
                            </div>

                            <div className="flex flex-col items-center">
                                <Button
                                    type="button"
                                    variant={
                                        isVideoOn ? "outline" : "destructive"
                                    }
                                    size="icon"
                                    className="h-14 w-14 rounded-full"
                                    onClick={toggleVideo}
                                >
                                    {isVideoOn ? (
                                        <Video className="h-6 w-6" />
                                    ) : (
                                        <VideoOff className="h-6 w-6" />
                                    )}
                                </Button>
                                <span className="text-xs mt-2">
                                    {isVideoOn ? "Stop video" : "Start video"}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <Separator />

                <CardFooter className="p-6">
                    <Button
                        className="w-full h-12 text-base font-medium"
                        onClick={handleJoinMeeting}
                    >
                        <Phone className="mr-2 h-5 w-5" />
                        Join Meeting Now
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default JoinMeeting;
