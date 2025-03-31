import React from "react";
import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Video,
    MapPin,
    CalendarIcon,
    Clock,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { format, addMonths, isBefore, startOfDay, isAfter } from "date-fns";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "sonner";

export default function BookAppointment() {
    const today = startOfDay(new Date());
    const oneMonthFromNow = startOfDay(addMonths(today, 1));

    const [date, setDate] = useState(today);
    const [timeSlot, setTimeSlot] = useState("");
    const [appointmentType, setAppointmentType] = useState("video");
    const [reason, setReason] = useState("");

    const [availableSlots, setAvailableSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const { userId, getToken } = useAuth();
    const { user } = useUser();
    useEffect(() => {
        const fetchAvailableSlots = async () => {
            if (!date) return;

            setIsLoadingSlots(true);
            setError(null);

            try {
                const response = await fetch(
                    `${
                        import.meta.env.VITE_MAIN_SERVER_URL
                    }/appointment/getAvailableTimeSlots/${format(
                        date,
                        "yyyy-MM-dd"
                    )}`,
                    {
                        headers: {
                            Authorization: `Bearer ${await getToken()}`,
                        },
                    }
                );

                let availableSlots = await response.json();
                if (date === today) {
                    const currentTime = new Date().getHours();
                    availableSlots = availableSlots.filter((slot) => {
                        let hour = parseInt(slot.split(":")[0]);
                        let meridiem = slot.split(" ")[1];
                        if (meridiem === "PM" && hour !== 12) {
                            hour += 12;
                        }
                        return hour > currentTime;
                    });
                }
                setAvailableSlots(availableSlots);
            } catch (err) {
                console.error("Error fetching time slots:", err);
                setError("Failed to fetch available slots. Please try again.");
                setAvailableSlots([]);
            } finally {
                setIsLoadingSlots(false);
            }
        };

        fetchAvailableSlots();
    }, [date, toast]);

    const handleConfirmAppointment = async () => {
        if (!timeSlot) {
            toast.error("Please select a time slot");
            return;
        }

        if (!reason.trim()) {
            toast.error("Please provide a reason for the appointment");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_MAIN_SERVER_URL}/appointment/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${await getToken()}`,
                    },
                    body: JSON.stringify({
                        userId,
                        date: format(date, "yyyy-MM-dd"),
                        timeSlot,
                        reason,
                        appointmentType,
                        user: user,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Failed to create appointment"
                );
            }

            toast.success("Appointment scheduled successfully");

            setTimeSlot("");
            setReason("");
            setDate(today);
            setAppointmentType("video");
        } catch (err) {
            console.error("Error creating appointment:", err);
            const errorMessage =
                err.message ||
                "Failed to schedule appointment. Please try again.";
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto max-w-7xl p-4 sm:p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold sm:text-3xl">
                    Book Appointment
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Schedule your next visit with Dr. Jane Smith
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Date Selection Card */}
                <Card className="overflow-hidden border shadow-sm transition-all duration-200 hover:shadow-md">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-3">
                        <CardTitle className="flex items-center">
                            <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                            Select Date & Time
                        </CardTitle>
                        <CardDescription>
                            Choose your preferred appointment date
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-4 pt-6">
                        <div className="rounded-lg border shadow-sm p-2">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                disabled={(d) =>
                                    isBefore(startOfDay(d), today) ||
                                    isAfter(startOfDay(d), oneMonthFromNow)
                                }
                                className="mx-auto flex justify-center items-center"
                            />
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="time-slot"
                                    className="text-base font-medium flex items-center"
                                >
                                    <Clock className="mr-2 h-4 w-4 text-primary" />
                                    Available Time Slots
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                    {format(date, "EEEE, MMMM d, yyyy")}
                                </span>
                            </div>

                            {isLoadingSlots ? (
                                <div className="flex h-10 items-center justify-center rounded-md border bg-muted/50 px-3 py-2 text-sm">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading available slots...
                                </div>
                            ) : error ? (
                                <div className="flex items-center rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    {error}
                                </div>
                            ) : availableSlots.length > 0 ? (
                                <Select
                                    value={timeSlot}
                                    onValueChange={setTimeSlot}
                                >
                                    <SelectTrigger
                                        id="time-slot"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select a time slot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSlots.map((slot) => (
                                            <SelectItem key={slot} value={slot}>
                                                {slot}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex items-center rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    No available slots for this date. Please
                                    select another date.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Appointment Details Card */}
                <Card className="overflow-hidden border shadow-sm transition-all duration-200 hover:shadow-md">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-3">
                        <CardTitle>Appointment Details</CardTitle>
                        <CardDescription>
                            Provide details for your appointment
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-4 pt-6 space-y-6">
                        <div className="space-y-3">
                            <Label className="text-base font-medium">
                                Appointment Type
                            </Label>
                            <RadioGroup
                                value={appointmentType}
                                onValueChange={setAppointmentType}
                                className="flex flex-col space-y-3"
                            >
                                <div
                                    className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-accent ${
                                        appointmentType === "video"
                                            ? "border-primary/50 bg-primary/5"
                                            : ""
                                    }`}
                                >
                                    <RadioGroupItem value="video" id="video" />
                                    <Label
                                        htmlFor="video"
                                        className="flex flex-1 cursor-pointer items-center"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Video className="h-5 w-5" />
                                        </div>
                                        <div className="ml-3">
                                            <span className="font-medium">
                                                Video Consultation
                                            </span>
                                            <p className="text-xs text-muted-foreground">
                                                Meet with your doctor online
                                            </p>
                                        </div>
                                    </Label>
                                </div>

                                <div
                                    className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-accent ${
                                        appointmentType === "in-person"
                                            ? "border-primary/50 bg-primary/5"
                                            : ""
                                    }`}
                                >
                                    <RadioGroupItem
                                        value="in-person"
                                        id="in-person"
                                    />
                                    <Label
                                        htmlFor="in-person"
                                        className="flex flex-1 cursor-pointer items-center"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div className="ml-3">
                                            <span className="font-medium">
                                                In-Person Visit
                                            </span>
                                            <p className="text-xs text-muted-foreground">
                                                Visit the clinic in person
                                            </p>
                                        </div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-3">
                            <Label
                                htmlFor="reason"
                                className="text-base font-medium"
                            >
                                Reason for Visit
                            </Label>
                            <Textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please describe your symptoms or reason for the appointment"
                                className="min-h-[150px] resize-none rounded-lg"
                            />
                            <p className="text-xs text-muted-foreground">
                                This information helps your doctor prepare for
                                your appointment. Please be as specific as
                                possible.
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter className="border-t bg-muted/20 p-4">
                        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:gap-2">
                            <Button variant="outline">Cancel</Button>
                            <Button
                                className="w-full sm:w-fit"
                                onClick={handleConfirmAppointment}
                                disabled={
                                    !timeSlot ||
                                    !reason.trim() ||
                                    isLoadingSlots ||
                                    isSubmitting
                                }
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Scheduling...
                                    </>
                                ) : (
                                    "Confirm Appointment"
                                )}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
