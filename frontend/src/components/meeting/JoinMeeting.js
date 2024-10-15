"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Mic, MicOff, VideoOff, Phone } from "lucide-react";
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
        // alert("Joining Meeting");
        router.push(`/meeting/live/${slug}`);
    };

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);
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
                    <div className="space-y-4">
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
                                name="email"
                            />
                        </div>
                        <div className="flex items-center justify-center space-x-4 mb-4">
                            <Button
                                className="w-full bg-[#FF7F50] text-white hover:bg-[#FF6347]"
                                onClick={handleJoinMeeting}
                            >
                                Join Meeting
                            </Button>
                        </div>
                    </div>
                </div>
                <p className="text-center mt-4 text-sm text-gray-600">
                    Meeting ID: <span className="font-semibold">{slug}</span>
                </p>
            </div>
        </div>
    );
};

export default JoinMeeting;
