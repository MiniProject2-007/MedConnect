import React from "react";
import { format } from "date-fns";
import { X, User, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function TranscriptDrawer({ open, onOpenChange, transcript }) {
    const formatTime = (dateString) => {
        try {
            return format(new Date(dateString), "h:mm a");
        } catch (error) {
            return "";
        }
    };

    const getSpeakerName = (speaker) => {
        return speaker === "doctor" ? "Doctor" : "Patient";
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md md:max-w-lg p-0 overflow-hidden flex flex-col h-full border-l border-slate-200 shadow-none">
                <SheetHeader className="px-6 py-4 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-lg font-medium text-slate-800">
                            Transcript
                        </SheetTitle>
                        <SheetClose asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X className="h-4 w-4 text-slate-500" />
                            </Button>
                        </SheetClose>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/50">
                    <div className="space-y-6 max-w-[95%] mx-auto">
                        {transcript.conversation.map((item, index) => {
                            const isDoctor = item.speaker === "doctor";
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.2,
                                        delay: index * 0.05,
                                    }}
                                    className={cn(
                                        "flex gap-3",
                                        isDoctor
                                            ? "flex-row"
                                            : "flex-row-reverse"
                                    )}
                                >
                                    <Avatar
                                        className={cn(
                                            "h-8 w-8 shrink-0 mt-1 flex justify-center items-center ring-2 ring-white shadow-sm",
                                            isDoctor
                                                ? "bg-indigo-50"
                                                : "bg-emerald-50"
                                        )}
                                    >
                                        {isDoctor ? (
                                            <Stethoscope className="h-4 w-4 text-indigo-600" />
                                        ) : (
                                            <User className="h-4 w-4 text-emerald-600" />
                                        )}
                                    </Avatar>

                                    <div
                                        className={cn(
                                            "space-y-1.5 max-w-[85%]",
                                            isDoctor
                                                ? "items-start"
                                                : "items-end"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "flex justify-between items-center w-full",
                                                isDoctor
                                                    ? "flex-row"
                                                    : "flex-row-reverse"
                                            )}
                                        >
                                            <p className="text-xs font-medium text-slate-700">
                                                {getSpeakerName(item.speaker)}
                                            </p>
                                            <span className="text-xs text-slate-400">
                                                {formatTime(item.time)}
                                            </span>
                                        </div>

                                        <div
                                            className={cn(
                                                "p-3 rounded-2xl text-sm break-words shadow-sm",
                                                isDoctor
                                                    ? "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                                                    : "bg-emerald-500 text-white rounded-tr-none"
                                            )}
                                        >
                                            {item.text}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
