import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CalendarIcon,
    ClockIcon,
    UserIcon,
    XCircleIcon,
    CheckCircleIcon,
} from "lucide-react";
import { getSlotString } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { toast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

const AppointmentCard = ({ appointment, fetchAppointments }) => {
    const { userId, getToken } = useAuth();
    const { date, timeSlot, status } = appointment;
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const router = useRouter();

    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case "approved":
                return {
                    color: "bg-green-500",
                    icon: <CheckCircleIcon className="h-4 w-4" />,
                    text: "Approved",
                };
            case "rejected":
                return {
                    color: "bg-red-500",
                    icon: <XCircleIcon className="h-4 w-4" />,
                    text: "Rejected",
                };
            case "cancelled":
                return {
                    color: "bg-red-500",
                    icon: <XCircleIcon className="h-4 w-4" />,
                    text: "Cancelled",
                };
            default:
                return {
                    color: "bg-yellow-500",
                    icon: <ClockIcon className="h-4 w-4" />,
                    text: "Pending",
                };
        }
    };

    const handleAppointmentAction = async (action) => {
        try {
            const token = await getToken();
            const endpoint =
                action === "cancel"
                    ? `cancelAppointment/${appointment._id}`
                    : action === "approve"
                    ? `approveAppointment/${appointment._id}`
                    : `rejectAppointment/${appointment._id}`;
            const response = await fetch(
                `http://localhost:5000/api/appointment/${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        userId: userId,
                    },
                }
            );
            const data = await response.json();
            if (response.ok) {
                toast({
                    title: `Appointment ${
                        action.charAt(0).toUpperCase() + action.slice(1)
                    }`,
                    description: `Appointment has been ${action}ed successfully.`,
                    variant: "default",
                });
                fetchAppointments();
            } else {
                throw new Error(
                    data.message || `Failed to ${action} appointment`
                );
            }
        } catch (err) {
            toast({
                title: "Error",
                description: `Failed to ${action} appointment. Please try again.`,
                variant: "destructive",
            });
        } finally {
            if (action === "cancel") setIsCancelDialogOpen(false);
            if (action === "approve") setIsApproveDialogOpen(false);
            if (action === "reject") setIsRejectDialogOpen(false);
        }
    };

    const statusInfo = getStatusInfo(status);

    return (
        <Card className="w-full h-full flex flex-col shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center justify-between flex-wrap gap-2">
                    <span>Appointment</span>
                    <Badge
                        className={`${statusInfo.color} text-white flex items-center gap-1 px-2 py-1`}
                    >
                        {statusInfo.icon}
                        <span>{statusInfo.text}</span>
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow pt-2">
                <div className="flex items-start space-x-3">
                    <UserIcon
                        className="h-5 w-5 text-[#FF7F50] mt-1 flex-shrink-0"
                        aria-hidden="true"
                    />
                    <div>
                        <span className="text-sm text-gray-600">With:</span>
                        <span className="font-medium block text-gray-800">
                            {appointment.with}
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <CalendarIcon
                        className="h-5 w-5 text-[#FF7F50] flex-shrink-0"
                        aria-hidden="true"
                    />
                    <div>
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="font-medium block text-gray-800">
                            {formatDate(date)}
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <ClockIcon
                        className="h-5 w-5 text-[#FF7F50] flex-shrink-0"
                        aria-hidden="true"
                    />
                    <div>
                        <span className="text-sm text-gray-600">Time:</span>
                        <span className="font-medium block text-gray-800">
                            {getSlotString(timeSlot)}
                        </span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-4 flex justify-between">
                {status === "approved" && (
                    <Button
                        className="w-fit bg-[#FF7F50] text-white hover:bg-[#FF6347] transition-colors duration-300"
                        onClick={() => {
                            router.push(`/meeting/joinmeeting/${appointment.meeting}`);
                        }}
                    >
                        Join Meeting
                    </Button>
                )}
                {status !== "cancelled" && appointment.userId2 !== userId && (
                    <Dialog
                        open={isCancelDialogOpen}
                        onOpenChange={setIsCancelDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-fit border-[#FF7F50] text-[#FF7F50] hover:bg-[#FF7F50] hover:text-white transition-colors duration-300"
                            >
                                Cancel
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Confirm Cancellation</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to cancel this
                                    appointment? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="sm:justify-start">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() =>
                                        handleAppointmentAction("cancel")
                                    }
                                    className="w-full sm:w-auto"
                                >
                                    Yes, Cancel Appointment
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCancelDialogOpen(false)}
                                    className="w-full sm:w-auto"
                                >
                                    No, Keep Appointment
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
                {appointment.userId2 === userId && status === "pending" && (
                    <>
                        <Dialog
                            open={isApproveDialogOpen}
                            onOpenChange={setIsApproveDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button className="w-fit bg-[#FF7F50] text-white hover:bg-[#FF6347] transition-colors duration-300">
                                    Approve
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        Approve Appointment
                                    </DialogTitle>
                                    <DialogDescription>
                                        Do you want to approve this appointment?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="sm:justify-start">
                                    <Button
                                        type="button"
                                        variant="default"
                                        onClick={() =>
                                            handleAppointmentAction("approve")
                                        }
                                        className="w-full sm:w-auto bg-green-600"
                                    >
                                        Yes, Approve Appointment
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setIsApproveDialogOpen(false)
                                        }
                                        className="w-full sm:w-auto"
                                    >
                                        No, Keep Pending
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog
                            open={isRejectDialogOpen}
                            onOpenChange={setIsRejectDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button className="w-fit bg-red-500 text-white hover:bg-red-600 transition-colors duration-300">
                                    Reject
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        Reject Appointment
                                    </DialogTitle>
                                    <DialogDescription>
                                        Do you want to reject this appointment?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="sm:justify-start">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() =>
                                            handleAppointmentAction("reject")
                                        }
                                        className="w-full sm:w-auto"
                                    >
                                        Yes, Reject Appointment
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setIsRejectDialogOpen(false)
                                        }
                                        className="w-full sm:w-auto"
                                    >
                                        No, Keep Pending
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </CardFooter>
        </Card>
    );
};

export default AppointmentCard;
