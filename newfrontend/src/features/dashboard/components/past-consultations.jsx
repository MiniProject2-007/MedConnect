import React from "react";
import { useState, useEffect } from "react";
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
import {
    Calendar,
    Download,
    FileCheck,
    Video,
    MapPin,
    AlertCircle,
} from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router";

export function PastConsultations() {
    const [pastConsultations, setPastConsultations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getToken, userId } = useAuth();
    const doctorToken = localStorage.getItem("doctorToken");

    const navigate = useNavigate();

    const getPastAppointments = async () => {
        const today = format(new Date(), "yyyy-MM-dd");
        setIsLoading(true);
        try {
            const res = doctorToken
                ? await fetch(
                      `${
                          import.meta.env.VITE_MAIN_SERVER_URL
                      }/appointment/pastAppointmentsDoctor/${today}`,
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
                      }/appointment/pastAppointments/${today}`,
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
                throw new Error("Failed to fetch past appointments");
            }

            const data = await res.json();
            setPastConsultations(data);
            setError(null);
        } catch (e) {
            console.error(e);
            setError("Could not load your past consultations");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getPastAppointments();
    }, []);

    // Helper function to get appointment type icon
    const getAppointmentTypeIcon = (type) => {
        if (type === "video") return <Video className="mr-1.5 h-3 w-3" />;
        return <MapPin className="mr-1.5 h-3 w-3" />;
    };

    // Helper function to capitalize first letter
    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        <Card className="bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Past Consultations</CardTitle>
                    <CardDescription>
                        Your previous appointments
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <a href="/consultations">View All</a>
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-[150px]">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="h-10 w-10 bg-primary/20 rounded-full mb-4"></div>
                            <div className="h-4 w-32 bg-primary/20 rounded mb-2"></div>
                            <div className="h-3 w-24 bg-primary/10 rounded"></div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex h-[150px] flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <h3 className="mt-3 text-lg font-medium">Error</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {error}
                        </p>
                        <Button
                            onClick={getPastAppointments}
                            className="mt-3"
                            size="sm"
                        >
                            Retry
                        </Button>
                    </div>
                ) : pastConsultations.length > 0 ? (
                    <div className="space-y-4">
                        {pastConsultations.map((consultation) => (
                            <div
                                key={consultation._id}
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
                                                    consultation.appointmentType ===
                                                    "video"
                                                        ? "default"
                                                        : "outline"
                                                }
                                                className="ml-2 rounded-full px-2.5 py-0.5 text-xs"
                                            >
                                                {getAppointmentTypeIcon(
                                                    consultation.appointmentType
                                                )}
                                                {capitalize(
                                                    consultation.appointmentType
                                                )}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {consultation.reason}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="mr-1.5 h-4 w-4 text-primary" />
                                        <span className="text-sm">
                                            {consultation.date}
                                        </span>
                                    </div>
                                </div>

                                {consultation.summary && (
                                    <div className="mt-3 p-2.5 bg-muted/30 rounded-md border border-muted/50">
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-medium text-foreground">
                                                Summary:
                                            </span>{" "}
                                            {consultation.summary}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1 px-3"
                                        onClick={() => {
                                            navigate(
                                                `/dashboard/appointment/${consultation._id}`
                                            );
                                        }}
                                    >
                                        <FileCheck className="h-3.5 w-3.5" />
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex h-[150px] flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="mt-3 text-lg font-medium">
                            No Past Consultations
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Your consultation history will appear here.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
