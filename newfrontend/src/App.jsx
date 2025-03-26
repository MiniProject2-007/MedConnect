import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./features/landing/pages/landing-page";
import DashboardPage from "./features/dashboard/pages/dashboard-page";
import { DashboardProvider } from "./features/dashboard/components/dashboard-provider";
import { DashboardLayout } from "./features/dashboard/components/dashboard-layout";
import BookAppointmentPage from "./features/appointment/pages/book-appointment-page";
import { useAuth } from "@clerk/clerk-react";
import MyConsultationsPage from "./features/appointment/pages/my-consultations-page";
import { Toaster } from "sonner";
import JoinMeetingPage from "./features/meeting/pages/join-meeting-page";

export default function App() {
    const { isSignedIn } = useAuth();
    return (
        <div className="w-full h-full font-main bg-gray-50">
            <Routes>
                <Route path="/" element={<LandingPage />} />

                {isSignedIn && (
                    <Route
                        path="/dashboard"
                        element={
                            <DashboardProvider>
                                <DashboardLayout />
                            </DashboardProvider>
                        }
                    >
                        <Route index element={<DashboardPage />} />
                        <Route
                            path="book-appointment"
                            element={<BookAppointmentPage />}
                        />
                        <Route
                            path="consultations"
                            element={<MyConsultationsPage />}
                        />
                        <Route
                            path="meeting/join/:id"
                            element={<JoinMeetingPage />}
                        />
                    </Route>
                )}
            </Routes>
            <Toaster />
        </div>
    );
}
