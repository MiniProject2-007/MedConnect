import React, { useEffect, useState } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, ClockIcon, FileIcon, LinkIcon } from "lucide-react";
import { getSlotString } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export const RecordAppointmentDetails = ({ appointment }) => {
    const { getToken } = useAuth();
    const [records, setRecords] = useState([]);

    const getRecords = async () => {
        const token = await getToken();
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_MAIN_SERVER}/record/getRecordsMeeting/${appointment.meeting}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (response.ok) {
            const data = await response.json();
            setRecords(data);
        }
    };

    useEffect(() => {
        if (appointment.meeting) {
            getRecords();
        }
    }, [appointment]);

    return (
        <DialogContent className="sm:max-w-[500px] max-w-full px-6 py-4">
            <DialogHeader>
                <DialogTitle className="text-[#FF7F50] text-2xl font-bold">
                    Appointment Details
                </DialogTitle>
            </DialogHeader>
            <ScrollArea className="mt-6 h-[300px] w-full rounded-md border p-4 shadow-lg bg-white">
                <h3 className="font-semibold text-lg mb-4">
                    Doctor:{" "}
                    <span className="text-gray-800">{appointment.doctorName}</span>
                </h3>
                <div className="mb-4">
                    <p className="flex items-center text-sm text-gray-600 mb-2">
                        <CalendarIcon className="inline-block mr-2 h-5 w-5 text-gray-500" />
                        Date: {formatDate(appointment.date)}
                    </p>
                    <p className="flex items-center text-sm text-gray-600 mb-4">
                        <ClockIcon className="inline-block mr-2 h-5 w-5 text-gray-500" />
                        Time: {getSlotString(appointment.timeSlot)}
                    </p>
                </div>
                
                <h4 className="font-semibold text-base mb-3">Records:</h4>
                {records.length > 0 ? (
                    records.map((record, index) => (
                        <div key={index} className="mb-3">
                            <div className="flex items-center">
                                <FileIcon className="inline-block mr-2 h-5 w-5 text-gray-500" />
                                <a
                                    href={record.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline text-sm"
                                >
                                    {record.name}
                                </a>
                            </div>
                            <p className="text-xs text-gray-500 ml-7">
                                {record.description}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-600">No records available</p>
                )}

                {appointment.meetingLink && (
                    <div className="mt-6">
                        <h4 className="font-semibold text-base mb-2">Meeting Recording:</h4>
                        <div className="flex items-center">
                            <LinkIcon className="inline-block mr-2 h-5 w-5 text-gray-500" />
                            <a
                                href={appointment.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline text-sm"
                            >
                                View Recording
                            </a>
                        </div>
                    </div>
                )}
            </ScrollArea>
        </DialogContent>
    );
};
