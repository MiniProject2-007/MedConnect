import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageSquare, FileUp } from "lucide-react";
import { useState } from "react";

const SideContent = ({roomId}) => {
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([
        { id: 1, sender: "Doctor", content: "Hello, how can I help you today?" },
        { id: 2, sender: "Patient", content: "I'm feeling a bit anxious about the upcoming procedure." },
        { id: 3, sender: "Doctor", content: "Don't worry, I'll be with you every step of the way." },
    ]);

    
    return (
        <Tabs defaultValue="chat" className="flex-grow flex flex-col">
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
                className="h-full p-2 flex flex-col justify-between"
            >
                <ScrollArea className="flex-grow ">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className="mb-4 p-2 bg-white rounded-lg shadow"
                        >
                            <div className="flex items-center mb-1">
                                <Avatar className="w-6 h-6 mr-2">
                                    <AvatarFallback>
                                        {message.sender[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-semibold">
                                    {message.sender}
                                </span>
                            </div>
                            <p className="text-gray-700">{message.content}</p>
                        </div>
                    ))}
                </ScrollArea>
                <form  className="mt-4">
                    <div className="flex space-x-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="border-[#FF7F50] focus:ring-[#FF7F50]"
                        />
                        <Button
                            type="submit"
                            className="bg-[#FF7F50] text-white hover:bg-[#FF9F70]"
                        >
                            Send
                        </Button>
                    </div>
                </form>
            </TabsContent>
            <TabsContent value="files" className="flex-grow p-2 flex flex-col">
                <Button className="w-full mb-4 bg-[#FF7F50] text-white hover:bg-[#FF9F70]">
                    <FileUp className="mr-2 h-4 w-4" /> Upload File
                </Button>
                <ScrollArea className="flex-grow">
                    <ul className="space-y-2">
                        {[
                            "Patient_History.pdf",
                            "Lab_Results.jpg",
                            "Treatment_Plan.docx",
                        ].map((file) => (
                            <li
                                key={file}
                                className="flex items-center justify-between p-2 bg-white rounded-lg shadow"
                            >
                                <span>{file}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[#FF7F50] hover:bg-gray-100 "
                                >
                                    View
                                </Button>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </TabsContent>
        </Tabs>
    );
};

export default SideContent;
