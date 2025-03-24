import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search, Bell, Menu, LogOut, User, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/sidebar";
import { toast } from "sonner";
import { useDashboard } from "./dashboard-provider";
import { UserButton } from "@clerk/clerk-react";

export function DashboardLayout({ children }) {
    const { sidebarOpen, toggleSidebar, currentUser } = useDashboard();
    const location = useLocation();
    const [isMounted, setIsMounted] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleNotificationClick = () => {
        toast.success("Clicked");
    };

    if (!isMounted) {
        return null;
    }

    return (
        <div className="h-screen flex flex-1">
            <Sidebar pathname={location.pathname} />
            <div className="h-screen overflow-auto w-full">
                <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2 md:hidden"
                        onClick={toggleSidebar}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>

                    {/* <div
                        className={`relative hidden transition-all duration-200 md:block ${
                            searchFocused
                                ? "w-[280px] lg:w-[320px]"
                                : "w-[200px] lg:w-[240px]"
                        }`}
                    >
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="pl-9 pr-4 h-9 rounded-full"
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                        />
                    </div> */}

                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative btn-icon-pulse"
                            onClick={handleNotificationClick}
                        >
                            <Bell className="h-5 w-5" />
                            <Badge
                                className="absolute right-2 top-1 flex h-2 w-2 items-center justify-center rounded-full p-0"
                                variant="destructive"
                            >
                                3
                            </Badge>
                        </Button>
                        <UserButton />
                    </div>
                </header>

                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
