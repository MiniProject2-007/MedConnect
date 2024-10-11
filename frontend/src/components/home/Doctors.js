"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User, MessageSquare, Calendar } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import DoctorCard from "../doctor/DoctorCard";

export default function Doctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getToken ,userId} = useAuth();

    const fetchDoctors = async () => {
        const token = await getToken();
        try {
            const response = await fetch(
                "http://localhost:5000/api/doctor/doctors",
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        userid:userId
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch doctors");
            }
            const data = await response.json();
            setDoctors(data);
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {[...Array(8)].map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                        <CardContent className="p-0">
                            <Skeleton className="h-48 w-full" />
                            <div className="p-4">
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between p-4">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 p-4">{error}</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {doctors.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
        </div>
    );
}
