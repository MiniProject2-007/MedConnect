import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { RecordAppointmentDetails } from "./RecordAppointmentDetails";
import { getSlotString } from "@/lib/utils";

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export const RecordAppointmentCard = ({ appointment }) => (
    <Card className="flex flex-col">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#FF7F50]">
                Appointment with Dr. {appointment.doctorName}
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
                <CalendarIcon className="inline-block mr-2 h-4 w-4" />
                {formatDate(appointment.date)}
            </p>
            <p className="text-sm text-gray-600">
                <ClockIcon className="inline-block mr-2 h-4 w-4" />
                {getSlotString(appointment.timeSlot)}
            </p>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="bg-[#FF7F50] text-white hover:bg-[#FF6347]">
                        View Details
                    </Button>
                </DialogTrigger>
                <RecordAppointmentDetails appointment={appointment} />
            </Dialog>
        </CardContent>
    </Card>
);
