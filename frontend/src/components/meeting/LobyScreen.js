"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "../HOC/SocketProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const LobbyScreen = () => {
    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");

    const socket = useSocket();
    const router = useRouter();

    const handleSubmitForm = useCallback(
        (e) => {
            e.preventDefault();
            socket.emit("room:join", { email, room });
        },
        [email, room, socket]
    );

    const handleJoinRoom = useCallback(
        (data) => {
            const { room } = data;
            router.push(`/meeting/${room}`);
        },
        [router]
    );

    useEffect(() => {
        socket.on("room:join", handleJoinRoom);
        return () => {
            socket.off("room:join", handleJoinRoom);
        };
    }, [socket, handleJoinRoom]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Card className="w-[350px] sm:w-[400px]">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-gray-800">
                        Join a Room
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmitForm} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border-[#FF7F50] focus:ring-[#FF7F50]"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="room">Room Number</Label>
                            <Input
                                type="text"
                                id="room"
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                                className="border-[#FF7F50] focus:ring-[#FF7F50]"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-[#FF7F50] text-white hover:bg-[#FF9F70]"
                        >
                            Join Room
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default LobbyScreen;
