import React from "react";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../hooks/use-socket";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    MessageSquare,
    Paperclip,
    FileUp,
    FileText,
    File,
    Image,
    Download,
    X,
    Loader2,
    Send,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addMessage } from "@/lib/redux/features/chatSlice";


const SideContent = ({ roomId }) => {
    const [newMessage, setNewMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [activeTab, setActiveTab] = useState("chat");

    const messages = useSelector((state) => state.chat.chat);
    const dispatch = useDispatch();
    const socket = useSocket();
    const { toast } = useToast();

    const scrollAreaRef = useRef(null);
    const fileInputRef = useRef(null);

    // Mock user data (in a real app, this would come from authentication)
    const user = {
        username: "Patient",
        imageUrl: "/placeholder.svg?height=40&width=40",
    };

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollArea = scrollAreaRef.current;
            scrollArea.scrollTop = scrollArea.scrollHeight;
        }
    }, [messages]);

    // Set up socket event listeners
    useEffect(() => {
        socket.on("chat:message", (message) => {
            dispatch(addMessage(message));

            // Show notification if not on chat tab
            if (activeTab !== "chat") {
                toast({
                    title: `New message from ${message.sender}`,
                    description:
                        message.message.length > 30
                            ? message.message.substring(0, 30) + "..."
                            : message.message,
                });
            }
        });

        socket.on("file:upload", (file) => {
            fetchFiles();

            // Show notification if not on files tab
            if (activeTab !== "files") {
                // toast({
                //   title: "New file shared",
                //   description: `${file.name || "A file"} has been shared in the consultation.`,
                // })
            }
        });

        return () => {
            socket.off("chat:message");
            socket.off("file:upload");
        };
    }, [socket, dispatch, activeTab, toast]);

    // Fetch files on component mount
    useEffect(() => {
        fetchFiles();
    }, []);

    // Send chat message
    const sendMessage = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim()) return;

        setIsSending(true);

        try {
            const messageData = {
                id: Math.random().toString(36).slice(2),
                sender: user?.username || "You",
                message: newMessage.trim(),
                profileimg: user?.imageUrl || "",
                timestamp: new Date().toISOString(),
            };

            socket.emit("chat:message", {
                room: roomId,
                message: messageData,
            });

            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
            //   toast({
            //     title: "Failed to send message",
            //     description: "Your message could not be sent. Please try again.",
            //     variant: "destructive",
            //   })
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                // toast({
                //   title: "File too large",
                //   description: "Please select a file smaller than 10MB.",
                //   variant: "destructive",
                // })
                setSelectedFile(null);
                return;
            }

            setSelectedFile(file);
        }
    };

    // Trigger file input click
    const handleSelectFile = () => {
        fileInputRef.current?.click();
    };

    // Clear selected file
    const handleClearFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Upload file
    const uploadFile = async () => {
        if (!selectedFile) return;

        setIsUploading(true);

        try {
            // In a real app, this would be an API call to upload the file
            // For demo purposes, we'll simulate a successful upload
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const mockResult = {
                id: Math.random().toString(36).slice(2),
                name: selectedFile.name,
                type: selectedFile.type,
                size: selectedFile.size,
                url: URL.createObjectURL(selectedFile), // In a real app, this would be a server URL
                createdAt: new Date().toISOString(),
            };

            socket.emit("file:upload", {
                room: roomId,
                file: mockResult,
            });

            // Also send a message about the file
            const messageData = {
                id: Math.random().toString(36).slice(2),
                sender: user?.username || "You",
                message: `Shared a file: ${selectedFile.name}`,
                profileimg: user?.imageUrl || "",
                timestamp: new Date().toISOString(),
                isFileMessage: true,
                fileInfo: {
                    name: selectedFile.name,
                    type: selectedFile.type,
                    url: mockResult.url,
                },
            };

            socket.emit("chat:message", {
                room: roomId,
                message: messageData,
            });

            //   toast({
            //     title: "File uploaded",
            //     description: "Your file has been shared successfully.",
            //   })

            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            // Add the file to our local state
            setFiles((prev) => [mockResult, ...prev]);
        } catch (error) {
            console.error("Error uploading file:", error);
            //   toast({
            //     title: "Upload failed",
            //     description: "Could not upload your file. Please try again.",
            //     variant: "destructive",
            //   })
        } finally {
            setIsUploading(false);
        }
    };

    // Fetch files
    const fetchFiles = async () => {
        try {
            // In a real app, this would be an API call to fetch files
            // For demo purposes, we'll simulate a successful fetch
            await new Promise((resolve) => setTimeout(resolve, 800));

            // If we already have files in state, don't overwrite them
            if (files.length > 0) return;

            // Mock files data
            const mockFiles = [
                {
                    id: "file1",
                    name: "Patient_History.pdf",
                    type: "application/pdf",
                    size: 2500000,
                    url: "#",
                    createdAt: new Date(Date.now() - 3600000).toISOString(),
                },
                {
                    id: "file2",
                    name: "X-Ray_Results.jpg",
                    type: "image/jpeg",
                    size: 1800000,
                    url: "#",
                    createdAt: new Date(Date.now() - 7200000).toISOString(),
                },
            ];

            setFiles(mockFiles);
        } catch (error) {
            console.error("Error fetching files:", error);
            //   toast({
            //     title: "Error loading files",
            //     description: "Could not load shared files. Please try again.",
            //     variant: "destructive",
            //   })
        }
    };

    // Get file icon based on file type
    const getFileIcon = (fileType) => {
        if (fileType?.startsWith("image/")) {
            return <Image className="h-4 w-4" />;
        } else if (fileType?.includes("pdf")) {
            return <FileText className="h-4 w-4" />;
        } else {
            return <File className="h-4 w-4" />;
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return "Unknown size";

        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    };

    return (
        <Tabs
            defaultValue="chat"
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col h-full"
        >
            <TabsList className="grid w-full grid-cols-3 p-1">
                <TabsTrigger
                    value="chat"
                    className="data-[state=active]:bg-[#FF7F50] data-[state=active]:text-white"
                >
                    <MessageSquare className="w-4 h-4 mr-2" /> Chat
                </TabsTrigger>
                <TabsTrigger
                    value="files"
                    className="data-[state=active]:bg-[#FF7F50] data-[state=active]:text-white"
                >
                    <FileUp className="w-4 h-4 mr-2" /> Files
                </TabsTrigger>
                <TabsTrigger
                    value="notes"
                    className="data-[state=active]:bg-[#FF7F50] data-[state=active]:text-white"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 mr-2"
                    >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Notes
                </TabsTrigger>
            </TabsList>

            {/* Chat tab */}
            <TabsContent
                value="chat"
                className="flex-1 flex flex-col h-[calc(100vh-8rem)]"
            >
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                        <div className="flex flex-col gap-4 py-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`max-w-[85%] ${
                                        message.sender === user?.username
                                            ? "ml-auto"
                                            : "mr-auto"
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
                                                message.sender ===
                                                user?.username
                                                    ? "text-[#FF7F50]"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            {message.sender}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(
                                                message.timestamp
                                            ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>

                                    {message.isFileMessage ? (
                                        <Card
                                            className={`overflow-hidden ${
                                                message.sender ===
                                                user?.username
                                                    ? "bg-[#FF7F50]/10 border-[#FF7F50]/20"
                                                    : "bg-gray-50 border-gray-200"
                                            }`}
                                        >
                                            <CardContent className="p-3 flex items-center gap-3">
                                                {getFileIcon(
                                                    message.fileInfo?.type
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {message.fileInfo?.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {message.message}
                                                    </p>
                                                </div>
                                                <a
                                                    href={message.fileInfo?.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[#FF7F50] hover:text-[#FF6347]"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div
                                            className={`p-3 rounded-lg ${
                                                message.sender ===
                                                user?.username
                                                    ? "bg-[#FF7F50] text-white"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            <p className="break-words whitespace-pre-wrap">
                                                {message.message}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Message input */}
                <div className="mt-4 border-t pt-4 px-4">
                    {selectedFile && (
                        <div className="mb-3 p-2 bg-gray-50 rounded-md border flex items-center justify-between">
                            <div className="flex items-center gap-2 truncate">
                                <Paperclip className="h-4 w-4 text-gray-500" />
                                <span className="text-sm truncate">
                                    {selectedFile.name}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                    {formatFileSize(selectedFile.size)}
                                </Badge>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 rounded-full"
                                onClick={handleClearFile}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    <form onSubmit={sendMessage} className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                            className="flex-1 border-[#FF7F50]/30 focus-visible:ring-[#FF7F50] focus-visible:border-[#FF7F50]"
                            disabled={isSending}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="border-[#FF7F50]/30 text-[#FF7F50] hover:bg-[#FF7F50]/10"
                            onClick={handleSelectFile}
                            disabled={isUploading || isSending}
                        >
                            <Paperclip className="h-4 w-4" />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#FF7F50] text-white hover:bg-[#FF6347]"
                            disabled={
                                (!newMessage.trim() && !selectedFile) ||
                                isSending ||
                                isUploading
                            }
                        >
                            {isSending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </form>

                    {selectedFile && (
                        <div className="mt-2 flex justify-end">
                            <Button
                                size="sm"
                                className="bg-[#FF7F50] text-white hover:bg-[#FF6347]"
                                onClick={uploadFile}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <FileUp className="mr-2 h-3 w-3" />
                                        Upload File
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </TabsContent>

            {/* Files tab */}
            <TabsContent value="files" className="h-full p-4">
                <div className="flex flex-col h-full">
                    <div className="mb-4">
                        <Button
                            onClick={handleSelectFile}
                            className="bg-[#FF7F50] text-white hover:bg-[#FF6347] w-full"
                            disabled={isUploading}
                        >
                            <FileUp className="mr-2 h-4 w-4" />
                            Select File to Share
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    {selectedFile && (
                        <Card className="mb-4 border-[#FF7F50]/20">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {getFileIcon(selectedFile.type)}
                                        <span className="font-medium truncate">
                                            {selectedFile.name}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 rounded-full"
                                        onClick={handleClearFile}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">
                                        {formatFileSize(selectedFile.size)}
                                    </Badge>
                                    <Button
                                        size="sm"
                                        className="bg-[#FF7F50] text-white hover:bg-[#FF6347]"
                                        onClick={uploadFile}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <FileUp className="mr-2 h-3 w-3" />
                                                Upload
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="text-sm font-medium mb-2 text-gray-500">
                        Shared Files
                    </div>

                    <ScrollArea className="flex-1">
                        {files.length > 0 ? (
                            <div className="space-y-2">
                                {files.map((file) => (
                                    <Card
                                        key={file.id}
                                        className="overflow-hidden hover:border-[#FF7F50]/30 transition-colors"
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    {getFileIcon(file.type)}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate">
                                                            {file.name}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(
                                                                    file.createdAt
                                                                ).toLocaleDateString()}
                                                            </p>
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {formatFileSize(
                                                                    file.size
                                                                )}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[#FF7F50] hover:text-[#FF6347] ml-2"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-center">
                                <FileText className="h-10 w-10 text-gray-300 mb-2" />
                                <p className="text-gray-500">
                                    No files have been shared yet
                                </p>
                                <p className="text-sm text-gray-400">
                                    Upload a file to share it with the
                                    consultation
                                </p>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </TabsContent>

            {/* Notes tab */}
            {/* <TabsContent value="notes" className="h-full p-4">
        <ConsultationNotes patientId="patient123" consultationId={roomId} />
      </TabsContent> */}
        </Tabs>
    );
};

export default SideContent;
