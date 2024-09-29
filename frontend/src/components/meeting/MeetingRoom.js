"use client";
import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Phone,
    Share2,
    MessageSquare,
    NotebookPen,
} from "lucide-react";
import SideContent from "./SideContent";
import Notes from "./Notes";
import { useSocket } from "../HOC/SocketProvider";

const MeetingRoom = ({ id }) => {
    const socket = useSocket();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const remoteVideoRef = useRef();
    const localVideoRef = useRef();
    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: true,
            })
            .then((stream) => {
                localVideoRef.current.srcObject = stream;
            });
    }, []);
    const handleCall = () => {};
    return (
        <div className="w-full h-screen relative">
            <video className="w-full h-full" ref={remoteVideoRef} autoPlay />
            <div className="absolute right-4 bottom-20 h-48 w-64 bg-gray-200 rounded-lg">
                <video
                    className="h-48 rounded-lg"
                    playsInline
                    autoPlay
                    ref={localVideoRef}
                />
            </div>
            <Card className="absolute bottom-0 left-0 w-full">
                <CardContent className="p-4">
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-[#FF7F50] text-[#FF7F50] hover:bg-gray-100"
                            onClick={() => setIsMuted(!isMuted)}
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
                            onClick={() => setIsVideoOn(!isVideoOn)}
                        >
                            {isVideoOn ? (
                                <Video className="w-4 h-4" />
                            ) : (
                                <VideoOff className="w-4 h-4" />
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 hover:bg-red-600 text-red-500"
                            onClick={handleCall}
                        >
                            <Phone className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-[#FF7F50] text-[#FF7F50] hover:bg-gray-100"
                        >
                            <Share2 className="w-4 h-4" />
                        </Button>
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-[#FF7F50] text-[#FF7F50] hover:bg-gray-100"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[90%]">
                                <SideContent />
                            </SheetContent>
                        </Sheet>
                        <Drawer>
                            <DrawerTrigger
                                variant="outline"
                                size="sm"
                                className="border border-[#FF7F50] text-[#FF7F50] hover:bg-gray-100 p-2 px-3 rounded-md"
                            >
                                <NotebookPen className="w-4 h-4" />
                            </DrawerTrigger>
                            <DrawerContent>
                                <Notes />
                            </DrawerContent>
                        </Drawer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MeetingRoom;
