import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageSquare, FileUp } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useSocket } from "../hooks/use-socket";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { addMessage } from "@/lib/redux/features/chatSlice";

const SideContent = ({ roomId }) => {
    console.log(roomId);
    const [newMessage, setNewMessage] = useState("");
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [files, setFiles] = useState([]);
    const messages = useAppSelector((state) => state.chat.chat);
    const dispatch = useAppDispatch();
    const { user } = useUser();
    const socket = useSocket();
    const scrollAreaRef = useRef(null);
    const { getToken, userId } = useAuth();
    useEffect(() => {
        socket.on("chat:message", (message) => {
            dispatch(addMessage(message));
        });

        socket.on("file:upload", (file) => {
            fetchFiles();
        });

        return () => {
            socket.off("chat:message");
        };
    }, [socket, dispatch]);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop =
                scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        fetchFiles();
    }, []);

    // Send chat message
    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            id: Math.random().toString(36).slice(2),
            sender: user.username,
            message: newMessage.trim(),
            profileimg: user.imageUrl ? user.imageUrl : "",
            timestamp: new Date().toISOString(),
        };

        socket.emit("chat:message", {
            room: roomId,
            message: messageData,
        });

        setNewMessage("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    };

    // File upload using fetch
    const uploadFile = async () => {
        if (!selectedFile) return;
        setIsLoadingFile(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("userId", userId);
        formData.append("meetingId", roomId);
        formData.append("description", "File uploaded in chat");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_MAIN_SERVER_URL}/record/createRecord`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${await getToken()}`,
                    },
                    body: formData,
                }
            );

            if (response.ok) {
                const result = await response.json();
                socket.emit("file:upload", {
                    room: roomId,
                    file: result,
                });
                console.log("File uploaded successfully", result);
                setSelectedFile(null); // Reset file input after upload
            } else {
                console.error("Failed to upload file");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setIsLoadingFile(false);
        }
    };

    const fetchFiles = async () => {
        try {
            const response = await fetch(
                `${
                    import.meta.env.VITE_MAIN_SERVER_URL
                }/record/getRecords/${roomId}`,
                {
                    headers: {
                        Authorization: `Bearer ${await getToken()}`,
                    },
                }
            );

            if (response.ok) {
                const result = await response.json();
                setFiles(result);
            } else {
                console.error("Failed to fetch files");
            }
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };

    return (
        <Tabs defaultValue="chat" className="flex-grow flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat" className=" p-3">
                    <MessageSquare className="w-4 h-4 mr-2" /> Chat
                </TabsTrigger>
                <TabsTrigger value="files" className="p-3">
                    <FileUp className="w-4 h-4 mr-2" /> Files
                </TabsTrigger>
            </TabsList>

            {/* Chat tab */}
            <TabsContent
                value="chat"
                className="flex-1 flex flex-col h-[calc(100vh-8rem)]"
            >
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                        <div className="flex flex-col-reverse gap-4 min-h-full">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`p-3 rounded-lg ${
                                        message.sender === user.username
                                            ? "ml-auto bg-primary"
                                            : "mr-auto bg-gray-100 max-w-[80%]"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Avatar className="w-6 h-6">
                                            <AvatarFallback>
                                                {message.sender?.[0]?.toUpperCase() ||
                                                    "?"}
                                            </AvatarFallback>
                                            {message.profileimg && (
                                                <AvatarImage
                                                    src={message.profileimg}
                                                    alt={`${message.sender}'s profile`}
                                                />
                                            )}
                                        </Avatar>
                                        <span
                                            className={`text-sm font-medium ${
                                                message.sender === user.username
                                                    ? "text-white"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            {message.sender}
                                        </span>
                                        <span
                                            className={`text-xs ${
                                                message.sender === user.username
                                                    ? "text-white/70"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            {new Date(
                                                message.timestamp
                                            ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    <p
                                        className={`break-words ${
                                            message.sender === user.username
                                                ? "text-white"
                                                : "text-gray-800"
                                        }`}
                                    >
                                        {message.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <div className="mt-4 border-t pt-4">
                    <form onSubmit={sendMessage} className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                            className="flex-1"
                        />
                        <Button type="submit" disabled={!newMessage.trim()}>
                            Send
                        </Button>
                    </form>
                </div>
            </TabsContent>

            {/* File tab */}
            <TabsContent value="files" className="h-full">
                <div className="p-4 flex flex-col h-full">
                    <Input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="mb-4"
                    />
                    <Button
                        onClick={uploadFile}
                        disabled={!selectedFile || isLoadingFile}
                    >
                        <FileUp className="mr-2 h-4 w-4" /> Upload File
                    </Button>
                    <ScrollArea className="flex-1">
                        <div className="space-y-2">
                            {files.map((file) => (
                                <div
                                    key={file._id}
                                    className="flex items-center justify-between p-2 bg-gray-100 rounded-lg"
                                >
                                    <div className="flex items-center gap-2">
                                        <FileUp className="w-4 h-4" />
                                        <span className="text-sm">
                                            {file.name}
                                        </span>
                                    </div>
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:underline"
                                    >
                                        Download
                                    </a>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </TabsContent>
        </Tabs>
    );
};

export default SideContent;
