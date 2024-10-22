"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Skeleton } from "../ui/skeleton";
import { RecordAppointmentCard } from "./RecordAppointmentCard";

const Records = () => {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { getToken, userId } = useAuth();

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = await getToken();
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_MAIN_SERVER}/appointment/getCompletedAppointments`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            userid: userId,
                        },
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    setAppointments(data);
                } else {
                    console.error("Failed to fetch appointments");
                }
            } catch (error) {
                console.error("Error fetching appointments:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, [getToken]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-[#FF7F50]">
                Completed Appointments
            </h1>
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Skeleton className="h-[200px] w-full" />
                    <Skeleton className="h-[200px] w-full" />
                    <Skeleton className="h-[200px] w-full" />
                </div>
            ) : appointments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appointments.map((appointment) => (
                        <RecordAppointmentCard
                            key={appointment._id}
                            appointment={appointment}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-600">
                    No completed appointments found.
                </p>
            )}
        </div>
    );
};

export default Records;
