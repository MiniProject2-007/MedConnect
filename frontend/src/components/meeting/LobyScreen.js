'use client';
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "../HOC/SocketProvider";

const LobbyScreen = ({ slug }) => {
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
            const { email, room } = data;
            router.push(`/meeting/live/${slug}`);
        },
        []
    );

    useEffect(() => {
        socket.on("room:join", handleJoinRoom);
        return () => {
            socket.off("room:join", handleJoinRoom);
        };
    }, [socket, handleJoinRoom]);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
                    Join Meeting Room
                </h1>
                <form onSubmit={handleSubmitForm} className="space-y-6">
                    <div className="space-y-2">
                        <label 
                            htmlFor="email" 
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label 
                            htmlFor="room" 
                            className="block text-sm font-medium text-gray-700"
                        >
                            Room Number
                        </label>
                        <input
                            type="text"
                            id="room"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                            placeholder="Enter room number"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        Join Meeting
                    </button>
                </form>
            </div>

            <footer className="mt-8 text-center text-sm text-gray-500">
                Make sure you allow camera and microphone access
            </footer>
        </div>
    );
};

export default LobbyScreen;