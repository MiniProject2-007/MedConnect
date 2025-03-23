import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    LayoutDashboard,
    Calendar,
    ClipboardList,
    MessageSquare,
    Settings,
    ChevronLeft,
    LogOutIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDashboard } from "@/features/dashboard/components/dashboard-provider";
import { SignOutButton } from "@clerk/clerk-react";

const navItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
    {
        title: "Book Appointment",
        icon: Calendar,
        href: "/dashboard/book-appointment",
    },
    {
        title: "My Consultations",
        icon: ClipboardList,
        href: "/dashboard/consultations",
    },
    {
        title: "Chat with Doctor",
        icon: MessageSquare,
        href: "/dashboard/chat",
    },
    {
        title: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
    },
];

export function Sidebar() {
    const { sidebarOpen, toggleSidebar, currentUser } = useDashboard();
    const location = useLocation(); // Get current pathname

    return (
        <>
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r bg-sidebar transition-transform duration-300 ease-in-out md:static md:z-0",
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full md:translate-x-0 md:w-16 md:items-center"
                )}
            >
                <div className="flex h-16 items-center border-b px-6">
                    <Link
                        to="/"
                        className="mr-4 flex items-center gap-2 font-semibold"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <span className="text-lg font-bold">H</span>
                        </div>
                        <span className="hidden text-xl font-bold md:inline-block">
                            HealthConnect
                        </span>
                    </Link>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-3 md:hidden"
                        onClick={toggleSidebar}
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="sr-only">Close Sidebar</span>
                    </Button>
                </div>

                <ScrollArea className="flex-1 px-4 py-4">
                    <div className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <Button
                                key={item.href}
                                variant="ghost"
                                className={cn(
                                    "justify-start",
                                    location.pathname === item.href &&
                                        "bg-sidebar-accent text-sidebar-accent-foreground",
                                    !sidebarOpen && "md:justify-center"
                                )}
                                asChild
                            >
                                <Link to={item.href}>
                                    <item.icon className="mr-2 h-5 w-5" />
                                    {sidebarOpen && <span>{item.title}</span>}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </ScrollArea>

                <div className="border-t p-4">
                    <SignOutButton>
                        <Button variant="ghost" className="w-full ">
                            Sign Out
                            <LogOutIcon className="h-5 w-5 ml-2" />
                        </Button>
                    </SignOutButton>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
