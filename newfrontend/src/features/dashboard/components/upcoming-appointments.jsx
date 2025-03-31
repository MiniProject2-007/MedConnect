import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Video, AlertCircle } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";

export function UpcomingAppointments() {
    const [upcomingConsultations, setUpcomingConsultations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getToken, userId } = useAuth();
    const doctorToken = localStorage.getItem("doctorToken");

    const getUpcomingConsultations = async () => {
        const today = format(new Date(), "yyyy-MM-dd");
        setIsLoading(true);
        try {
            const res = doctorToken
                ? await fetch(
                      `${
                          import.meta.env.VITE_MAIN_SERVER_URL
                      }/appointment/upcomingAppointmentsDoctor/${today}`,
                      {
                          method: "GET",
                          headers: {
                              "Content-Type": "application/json",
                              authorization: doctorToken,
                              userid: userId,
                          },
                      }
                  )
                : await fetch(
                      `${
                          import.meta.env.VITE_MAIN_SERVER_URL
                      }/appointment/upcomingAppointments/${today}`,
                      {
                          method: "GET",
                          headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${await getToken()}`,
                              userid: userId,
                          },
                      }
                  );

            if (!res.ok) {
                throw new Error("Failed to fetch appointments");
            }

            const data = await res.json();
            setUpcomingConsultations(data);
            setError(null);
        } catch (e) {
            console.error(e);
            setError("Could not load your appointments");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getUpcomingConsultations();
    }, []);

    const getAppointmentTypeIcon = (type) => {
        if (type === "video") return <Video className="mr-1.5 h-3 w-3" />;
        return <MapPin className="mr-1.5 h-3 w-3" />;
    };

    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        <Card className="bg-white h-full">
            <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-[200px]">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="h-10 w-10 bg-primary/20 rounded-full mb-4"></div>
                            <div className="h-4 w-32 bg-primary/20 rounded mb-2"></div>
                            <div className="h-3 w-24 bg-primary/10 rounded"></div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium">Error</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {error}
                        </p>
                        <Button
                            onClick={getUpcomingConsultations}
                            className="mt-4"
                        >
                            Retry
                        </Button>
                    </div>
                ) : upcomingConsultations.length > 0 ? (
                    <div className="space-y-4">
                        {upcomingConsultations.map((appointment) => (
                            <div
                                key={appointment._id}
                                className="rounded-lg border bg-card p-4 transition-all duration-200 hover:shadow-sm"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center">
                                            <h4 className="font-semibold">
                                                Appointment
                                            </h4>
                                            <Badge
                                                variant={
                                                    appointment.appointmentType ===
                                                    "video"
                                                        ? "default"
                                                        : "outline"
                                                }
                                                className="ml-2 rounded-full px-2.5 py-0.5 text-xs"
                                            >
                                                {getAppointmentTypeIcon(
                                                    appointment.appointmentType
                                                )}
                                                {capitalize(
                                                    appointment.appointmentType
                                                )}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {appointment.reason}
                                        </p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={`rounded-full px-2.5 py-0.5 text-xs ${
                                            appointment.status === "pending"
                                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                                : appointment.status ===
                                                  "approved"
                                                ? "bg-green-50 text-green-700 border-green-200"
                                                : "bg-blue-50 text-blue-700 border-blue-200"
                                        }`}
                                    >
                                        {capitalize(appointment.status)}
                                    </Badge>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <Calendar className="mr-1.5 h-4 w-4 text-primary" />
                                        {appointment.date}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="mr-1.5 h-4 w-4 text-primary" />
                                        {appointment.timeSlot}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium">
                            No Upcoming Appointments
                        </h3>
                        {!doctorToken && (
                            <>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Schedule your next appointment.
                                </p>
                                <Button className="mt-4">
                                    Book Appointment
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
