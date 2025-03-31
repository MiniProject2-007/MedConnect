import React from "react";
import { PastConsultations } from "../components/past-consultations";
import { QuickActions } from "../components/quick-actions";
import { UpcomingAppointments } from "../components/upcoming-appointments";
import { WelcomeSection } from "../components/welcome-section";
import { DashboardLayout } from "../components/dashboard-layout";
import { NotificationsSection } from "../components/notifications-section";

function DashboardPage() {
    return (
        <div className="flex w-full flex-col gap-6 p-4 items-center">
            <div className="min-w-[70%] max-w-4xl">
                <UpcomingAppointments />
            </div>
            <div className="min-w-[70%] max-w-4xl">
                <PastConsultations />
            </div>
        </div>
    );
}

export default DashboardPage;
