import React from "react";
import { createContext, useContext, useState, useEffect } from "react";

const defaultContext = {
    sidebarOpen: true,
    setSidebarOpen: () => {},
    toggleSidebar: () => {},
    currentTime: "",
    currentUser: {
        name: "John Doe",
        email: "john.doe@example.com",
        profileImage: "/placeholder.svg?height=96&width=96",
    },
};

const DashboardContext = createContext(defaultContext);

export function DashboardProvider(props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentTime, setCurrentTime] = useState("");

    // Get time of day and format the greeting
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const time = now.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });
            setCurrentTime(time);
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    // On mobile, sidebar is closed by default
    useEffect(() => {
        const checkMobile = () => {
            setSidebarOpen(window.innerWidth >= 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    function toggleSidebar() {
        setSidebarOpen((prev) => !prev);
    }

    return (
        <DashboardContext.Provider
            value={{
                sidebarOpen,
                setSidebarOpen,
                toggleSidebar,
                currentTime,
                currentUser: defaultContext.currentUser,
            }}
        >
            {props.children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error("useDashboard must be used within a DashboardProvider");
    }
    return context;
}
