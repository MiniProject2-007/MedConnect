'use client';

import { useAuth } from "@clerk/nextjs";
import AppointmentCard from "./AppointmentCard";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon } from "lucide-react";

const AppointmentsSkeleton = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {[...Array(4)].map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md p-4 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
  </div>
);

const Appointments = () => {
    const { userId, getToken } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_MAIN_SERVER}/appointment/appointments`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    userId: userId,
                },
            });
            const data = await response.json();
            setAppointments(data);
        } catch (err) {
            console.error("Fetch Appointments Error: ", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    return (
        <div className="">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800 flex items-center">
                    <CalendarIcon className="mr-2 h-8 w-8 text-[#FF7F50]" />
                    Your Appointments
                </h1>
                {isLoading ? (
                    <AppointmentsSkeleton />
                ) : appointments.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {appointments.map((appointment) => (
                            <AppointmentCard
                                key={appointment._id}
                                appointment={appointment}
                                fetchAppointments={fetchAppointments}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">No appointments found</h2>
                        <p className="text-gray-500">You don't have any appointments scheduled at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointments;