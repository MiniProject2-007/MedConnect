import React from "react";
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
import { Video, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

export default function BookAppointment() {
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
                {/* Date & Time Selection */}
                <Card className="card-modern">
                    <CardHeader className="pb-3">
                        <CardTitle>Select Date & Time</CardTitle>
                        <CardDescription>
                            Choose your preferred appointment date
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="p-4 pb-0">
                            <div className="rounded-lg border shadow-sm">
                                <Calendar
                                    mode="single"
                                    className="rounded-md border border-gray-300 mx-auto w-full flex justify-center items-center"
                                    classNames={{
                                        day_selected:
                                            "bg-[#FF7F50] text-white hover:bg-[#FF6347]",
                                    }}
                                />
                            </div>
                        </div>

                        <div className="p-4 pt-2">
                            <div className="rounded-lg border p-3">
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        "9:00 AM",
                                        "10:00 AM",
                                        "11:00 AM",
                                        "12:00 PM",
                                        "1:00 PM",
                                        "2:00 PM",
                                        "3:00 PM",
                                        "4:00 PM",
                                    ].map((time) => (
                                        <div
                                            key={time}
                                            className="flex h-10 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground"
                                        >
                                            {time}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Appointment Details */}
                <Card className="card-modern">
                    <CardHeader className="pb-3">
                        <CardTitle>Appointment Details</CardTitle>
                        <CardDescription>
                            Provide details for your appointment
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label>Appointment Type</Label>
                            <RadioGroup
                                defaultValue="video"
                                className="flex flex-col space-y-2"
                            >
                                <div className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-accent">
                                    <RadioGroupItem value="video" id="video" />
                                    <Label
                                        htmlFor="video"
                                        className="flex flex-1 cursor-pointer items-center"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
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
                                <div className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-accent">
                                    <RadioGroupItem
                                        value="in-person"
                                        id="in-person"
                                    />
                                    <Label
                                        htmlFor="in-person"
                                        className="flex flex-1 cursor-pointer items-center"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
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

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Visit</Label>
                            <Textarea
                                id="reason"
                                placeholder="Please describe your symptoms or reason for the appointment"
                                className="min-h-[120px] resize-none rounded-lg"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button className="w-fit rounded-md">
                            Confirm Appointment
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
