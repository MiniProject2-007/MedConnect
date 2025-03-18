import React from "react";
import { Route, Routes } from "react-router";
import LandingPage from "./features/landing/pages/landing-page";
import DashboardPage from "./features/dashboard/pages/dashboard-page";
import { DashboardProvider } from "./features/dashboard/components/dashboard-provider";

export default function App() {
    return (
        <div className="w-full h-full font-main">
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route
                    path="/dashboard"
                    element={
                        <DashboardProvider>
                            <DashboardPage />
                        </DashboardProvider>
                    }
                />
            </Routes>
        </div>
    );
}
