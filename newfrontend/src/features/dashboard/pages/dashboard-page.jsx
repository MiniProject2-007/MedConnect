import React from "react";
import { PastConsultations } from "../components/past-consultations";
import { QuickActions } from "../components/quick-actions";
import { UpcomingAppointments } from "../components/upcoming-appointments";
import { WelcomeSection } from "../components/welcome-section";
import { DashboardLayout } from "../components/dashboard-layout";
import { NotificationsSection } from "../components/notifications-section";

function DashboardPage() {
    return (
        <div className="grid gap-6 p-6 md:grid-cols-12">
            <div className="col-span-12">
                <WelcomeSection />
            </div>
            <div className="col-span-12 md:col-span-8">
                <UpcomingAppointments />
            </div>
            <div className="col-span-12 md:col-span-4">
                <QuickActions />
            </div>
            <div className="col-span-12 md:col-span-8">
                <PastConsultations />
            </div>
            <div className="col-span-12 md:col-span-4">
                <NotificationsSection />
            </div>
        </div>
    );
}

export default DashboardPage;
