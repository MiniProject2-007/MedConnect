import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Download,
    FileText,
    FileCheck,
    Calendar,
    Video,
    Map,
} from "lucide-react";
import { PastConsultationCard } from "./past-consultation-card";
import { UpcomingConsultationCard } from "./upcoming-consultation-card";
import { useAuth } from "@clerk/clerk-react";
import { EmptyState } from "./empty-state";
import { format } from "date-fns";

export default function MyConsultations() {
    const [upcomingConsultations, setUpcomingConsultations] = useState([]);
    const [pastConsultations, setPastConsultations] = useState([]);
    const { getToken, userId } = useAuth();
    const doctorToken = localStorage.getItem("doctorToken");

    const getUpcomingConsultations = async () => {
        const today = format(new Date(), "yyyy-MM-dd");
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
                throw new Error("Failed to fetch upcoming consultations");
            }
            const data = await res.json();
            setUpcomingConsultations(data);
        } catch (e) {
            console.log(e);
        }
    };
    const getPastAppointments = async () => {
        const today = format(new Date(), "yyyy-MM-dd");
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
        } catch (e) {
            console.log(e);
        }
    };
    useEffect(() => {
        getUpcomingConsultations();
        getPastAppointments();
    }, []);
    return (
        <div className="container mx-auto max-w-5xl p-4 sm:p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold sm:text-3xl">
                    My Consultations
                </h1>
                <p className="mt-1 text-muted-foreground">
                    View and manage your appointments
                </p>
            </div>

            <Tabs defaultValue="upcoming" className="space-y-6">
                <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1">
                    <TabsTrigger
                        value="upcoming"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                        Upcoming
                    </TabsTrigger>
                    <TabsTrigger
                        value="past"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                        Past
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4">
                    {upcomingConsultations.length > 0 ? (
                        upcomingConsultations.map((consultation) => (
                            <UpcomingConsultationCard
                                key={consultation._id}
                                consultation={consultation}
                                refetch={getUpcomingConsultations}
                            />
                        ))
                    ) : (
                        <EmptyState type="upcoming" />
                    )}
                </TabsContent>

                <TabsContent value="past" className="space-y-4">
                    {pastConsultations.length > 0 ? (
                        pastConsultations.map((consultation) => (
                            <PastConsultationCard
                                key={consultation._id}
                                consultation={consultation}
                            />
                        ))
                    ) : (
                        <EmptyState type="past" />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
