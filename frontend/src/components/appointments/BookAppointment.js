"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, addMonths, isBefore, isAfter, startOfDay } from "date-fns";
import { cn, getSlotString } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

const BookAppointment = ({ doctor }) => {
    const today = new Date();
    const oneMonthFromNow = addMonths(today, 1);
    const [date, setDate] = useState(today);
    const [timeSlot, setTimeSlot] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dateAndSlots = doctor.availableDates;

    const {userId,getToken} = useAuth()
    const handleBookAppointment = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        if (!date || !timeSlot) {
            setError("Please select both date and time slot");
            setIsLoading(false);
            return;
        }

        try {
            const token = await getToken()
            const response = await fetch("http://localhost:5000/api/appointment/bookAppointment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId1: userId, 
                    userId2: doctor.userId,
                    date: format(date, "yyyy-MM-dd"),
                    timeSlot,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Failed to book appointment"
                );
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

   

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    className="flex items-center bg-[#FF7F50] text-white hover:bg-[#FF6347]"
                >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Appoint
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                        Book Appointment
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Select a date and time slot to book an appointment with
                        Dr. {doctor.lastName}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col space-y-2">
                        <label
                            htmlFor="date"
                            className="text-sm font-medium text-gray-700"
                        >
                            Date
                        </label>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(date) => {
                                setDate(date);
                            }}
                            disabled={(date) =>
                                isBefore(startOfDay(date), startOfDay(today)) ||
                                isAfter(
                                    startOfDay(date),
                                    startOfDay(oneMonthFromNow)
                                ) ||
                                !dateAndSlots[format(date, "yyyy-MM-dd")]
                            }
                            className="rounded-md border border-gray-300 mx-auto w-full flex justify-center items-center"
                            classNames={{
                                day_selected:
                                    "bg-[#FF7F50] text-white hover:bg-[#FF6347]",
                                day_today: `${
                                    format(date, "yyyy-MM-dd") ===
                                    format(today, "yyyy-MM-dd")
                                        ? "bg-[#FF7F50]"
                                        : "bg-accent"
                                } text-accent-foreground`,
                            }}
                        />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label
                            htmlFor="timeSlot"
                            className="text-sm font-medium text-gray-700"
                        >
                            Time Slot
                        </label>
                        <Select onValueChange={setTimeSlot}>
                            <SelectTrigger
                                id="timeSlot"
                                className="w-full border-gray-300"
                            >
                                <SelectValue placeholder="Select time slot" />
                            </SelectTrigger>
                            <SelectContent>
                                {dateAndSlots[format(date, "yyyy-MM-dd")]?.map(
                                    (slot) => (
                                        <SelectItem key={slot} value={slot}>
                                           {getSlotString(slot)}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {success && (
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>
                            Appointment booked successfully!
                        </AlertDescription>
                    </Alert>
                )}
                <DialogFooter>
                    <Button
                        onClick={handleBookAppointment}
                        disabled={isLoading}
                        className="w-full bg-[#FF7F50] text-white hover:bg-[#FF6347]"
                    >
                        {isLoading ? "Booking..." : "Book Appointment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BookAppointment;
