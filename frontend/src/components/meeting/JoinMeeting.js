"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Mic, MicOff, VideoOff } from "lucide-react";
import { useSocket } from "../HOC/SocketProvider";
import { useRouter } from "next/navigation";

const JoinMeeting = ({ slug }) => {
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [localStream, setLocalStream] = useState(null);
    const [email, setEmail] = useState("");
    const socket = useSocket();
    const router = useRouter();

    const videoRef = useRef(null);
    
    const toggleMic = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !isMicOn;
            });
        }
        setIsMicOn(!isMicOn);
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !isVideoOn;
            });
        }
        setIsVideoOn(!isVideoOn);
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            setLocalStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing media devices:", err);
            setIsVideoOn(false);
            setIsMicOn(false);
        }
    };

    const stopCamera = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach(track => {
                track.stop();
            });
            setLocalStream(null);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    }, [localStream]);

    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        socket.emit("room:join", { email, room: slug });
    }, [email, slug, socket]);

    const handleJoinRoom = useCallback((data) => {
        const { email, room } = data;
        router.push(`/meeting/live/${slug}`);
    }, [router, slug]);

    useEffect(() => {
        startCamera();
        
        socket.on("room:join", handleJoinRoom);
        
        return () => {
            stopCamera();
            socket.off("room:join", handleJoinRoom);
        };
    }, [socket, handleJoinRoom, stopCamera]);

    return (
        <div className="min-h-screen md:flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
                    Join Meeting
                </h1>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                        <video
                            className={`w-full h-full object-cover ${
                                isVideoOn ? "" : "hidden"
                            }`}
                            autoPlay
                            muted
                            playsInline
                            ref={videoRef}
                        />
                        <div
                            className={`w-full h-full flex items-center justify-center bg-gray-700 text-white ${
                                isVideoOn ? "hidden" : ""
                            }`}
                        >
                            <VideoOff size={48} />
                        </div>
                    </div>
                    <form onSubmit={handleSubmitForm} className="space-y-4">
                        <div className="flex justify-center space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                className={`rounded-full p-3 w-12 h-12 ${
                                    isMicOn ? "bg-gray-200" : "bg-red-100"
                                }`}
                                onClick={toggleMic}
                            >
                                {isMicOn ? (
                                    <Mic className="h-6 w-6" />
                                ) : (
                                    <MicOff className="h-6 w-6 text-red-500" />
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className={`rounded-full p-3 w-12 h-12 ${
                                    isVideoOn ? "bg-gray-200" : "bg-red-100"
                                }`}
                                onClick={toggleVideo}
                            >
                                {isVideoOn ? (
                                    <Video className="h-6 w-6" />
                                ) : (
                                    <VideoOff className="h-6 w-6 text-red-500" />
                                )}
                            </Button>
                        </div>
                        <div>
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-[#FF7F50] text-white hover:bg-[#FF6347]"
                        >
                            Join Meeting
                        </Button>
                    </form>
                </div>
                <p className="text-center mt-4 text-sm text-gray-600">
                    Meeting ID: <span className="font-semibold">{slug}</span>
                </p>
            </div>
        </div>
    );
};

export default JoinMeeting;