import AppointmentCard from "./AppointmentCard";
import React from "react";

const demoAppointments = [
    {
        id: 1,
        userId1: "Dr. Smith",
        userId2: "John Doe",
        date: new Date("2023-06-15"),
        time: "10:00 AM",
        status: "approved",
    },
    {
        id: 2,
        userId1: "Dr. Johnson",
        userId2: "Jane Smith",
        date: new Date("2023-06-16"),
        time: "2:30 PM",
        status: "pending",
    },
    {
        id: 3,
        userId1: "Dr. Williams",
        userId2: "Robert Brown",
        date: new Date("2023-06-17"),
        time: "11:15 AM",
        status: "rejected",
    },
];

const Appointments = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
                Your Appointments
            </h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {demoAppointments.map((appointment) => (
                    <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                    />
                ))}
            </div>
        </div>
    );
};

export default Appointments;
