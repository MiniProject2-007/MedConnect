import React from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react";

const AppointmentCard = ({ appointment }) => {
    const { userId1, userId2, date, time, status } = appointment;

    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "approved":
                return "bg-green-500";
            case "rejected":
                return "bg-red-500";
            default:
                return "bg-yellow-500";
        }
    };

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center justify-between flex-wrap gap-2">
                    <span>Appointment</span>
                    <Badge className={`${getStatusColor(status)} text-white`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                <div className="flex items-start space-x-2">
                    <UserIcon className="h-5 w-5 text-[#FF7F50] mt-1 flex-shrink-0" />
                    <div>
                        <span className="text-sm text-gray-600">
                            Participants:
                        </span>
                        <span className="font-medium block">
                            {userId1}, {userId2}
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-[#FF7F50] flex-shrink-0" />
                    <div>
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="font-medium block">
                            {formatDate(date)}
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-[#FF7F50] flex-shrink-0" />
                    <div>
                        <span className="text-sm text-gray-600">Time:</span>
                        <span className="font-medium block">{time}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                    variant="outline"
                    className="w-full sm:w-auto border-[#FF7F50] text-[#FF7F50] hover:bg-[#FF7F50] hover:text-white"
                >
                    Reschedule
                </Button>
                <Button className="w-full sm:w-auto bg-[#FF7F50] text-white hover:bg-[#FF9F70]">
                    Join Meeting
                </Button>
            </CardFooter>
        </Card>
    );
};

export default AppointmentCard;
