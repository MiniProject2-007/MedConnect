import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageSquare, FileUp } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useSocket } from "../HOC/SocketProvider";
import { useUser } from "@clerk/nextjs";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { addMessage } from "@/lib/redux/features/chatSlice";

const SideContent = ({ roomId }) => {
    const [newMessage, setNewMessage] = useState("");
    const messages = useAppSelector((state) => state.chat.chat);
    const dispatch = useAppDispatch();
    const { user } = useUser();
    const socket = useSocket();
    const scrollAreaRef = useRef(null);

    useEffect(() => {
        socket.on("chat:message", (message) => {
            dispatch(addMessage(message));
        });

        return () => {
            socket.off("chat:message");
        };
    }, [socket, dispatch]);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

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
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    };

    return (
        <Tabs defaultValue="chat" className="flex-grow flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                    value="chat"
                    className="data-[state=active]:bg-[#FF7F50] data-[state=active]:text-white p-3"
                >
                    <MessageSquare className="w-4 h-4 mr-2" /> Chat
                </TabsTrigger>
                <TabsTrigger
                    value="files"
                    className="data-[state=active]:bg-[#FF7F50] data-[state=active]:text-white p-3"
                >
                    <FileUp className="w-4 h-4 mr-2" /> Files
                </TabsTrigger>
            </TabsList>

            <TabsContent
                value="chat"
                className="flex-1 flex flex-col h-[calc(100vh-8rem)]"
            >
                <div className="flex-1 overflow-hidden">
                    <ScrollArea 
                        className="h-full pr-4" 
                        ref={scrollAreaRef}
                    >
                        <div className="flex flex-col-reverse gap-4 min-h-full">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`p-3 rounded-lg ${
                                        message.sender === user.username
                                            ? 'ml-auto bg-[#FF7F50] text-white max-w-[80%]'
                                            : 'mr-auto bg-gray-100 max-w-[80%]'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Avatar className="w-6 h-6">
                                            <AvatarFallback>
                                                {message.sender?.[0]?.toUpperCase() || '?'}
                                            </AvatarFallback>
                                            {message.profileimg && (
                                                <AvatarImage
                                                    src={message.profileimg}
                                                    alt={`${message.sender}'s profile`}
                                                />
                                            )}
                                        </Avatar>
                                        <span className={`text-sm font-medium ${
                                            message.sender === user.username
                                                ? 'text-white'
                                                : 'text-gray-700'
                                        }`}>
                                            {message.sender}
                                        </span>
                                        <span className={`text-xs ${
                                            message.sender === user.username
                                                ? 'text-white/70'
                                                : 'text-gray-500'
                                        }`}>
                                            {new Date(message.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p className={`break-words ${
                                        message.sender === user.username
                                            ? 'text-white'
                                            : 'text-gray-800'
                                    }`}>
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
                            className="flex-1 border-[#FF7F50] focus:ring-[#FF7F50]"
                        />
                        <Button
                            type="submit"
                            className="bg-[#FF7F50] text-white hover:bg-[#FF9F70]"
                            disabled={!newMessage.trim()}
                        >
                            Send
                        </Button>
                    </form>
                </div>
            </TabsContent>

            <TabsContent value="files" className="h-full">
                <div className="p-4 flex flex-col h-full">
                    <Button className="w-full mb-4 bg-[#FF7F50] text-white hover:bg-[#FF9F70]">
                        <FileUp className="mr-2 h-4 w-4" /> Upload File
                    </Button>
                    <ScrollArea className="flex-1">
                        <div className="space-y-2">
                            {[
                                "Patient_History.pdf",
                                "Lab_Results.jpg",
                                "Treatment_Plan.docx",
                            ].map((file) => (
                                <div
                                    key={file}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-gray-700">{file}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-[#FF7F50] hover:bg-[#FF7F50]/10"
                                    >
                                        View
                                    </Button>
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