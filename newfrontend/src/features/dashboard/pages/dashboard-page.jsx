import React from "react";
import { PastConsultations } from "../components/past-consultations";
import { UpcomingAppointments } from "../components/upcoming-appointments";

function DashboardPage() {
    return (
        <div className="flex w-full flex-col gap-6 p-4 items-center">
            <div className="w-full max-w-4xl">
                <UpcomingAppointments />
            </div>
            <div className="w-full max-w-4xl">
                <PastConsultations />
            </div>
        </div>
    );
}

export default DashboardPage;
