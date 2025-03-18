import React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, Bell, Menu } from "lucide-react";

import { Sidebar } from "@/components/sidebar";
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
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "./dashboard-provider";

export function DashboardLayout(props) {
    const { sidebarOpen, toggleSidebar } = useDashboard();
    const [pathname, setPathname] = useState("/");
    const [isMounted, setIsMounted] = useState(false);

    // Prevent hydration errors
    useEffect(() => {
        setIsMounted(true);
        setPathname(window.location.pathname);
    }, []);

    const handleNotificationClick = () => {
        toast("Notifications", {
            description: "You have 3 unread notifications.",
        });
    };

    if (!isMounted) {
        return null;
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={toggleSidebar}
                >
                    <Menu className="size-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>

                <a
                    href="/"
                    className="hidden items-center gap-2 font-semibold md:flex"
                >
                    <span className="text-primary">HealthConnect</span>
                </a>

                {/* <MainNav className="mx-6 hidden md:flex" /> */}

                <div className="ml-auto flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="w-[200px] pl-8 md:w-[240px] lg:w-[320px]"
                        />
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                        onClick={handleNotificationClick}
                    >
                        <Bell className="size-5" />
                        <Badge
                            className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full p-0"
                            variant="destructive"
                        >
                            3
                        </Badge>
                    </Button>

                    {/* <ModeToggle /> */}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative size-8 rounded-full"
                            >
                                <Avatar className="size-8">
                                    <AvatarImage
                                        src="/placeholder.svg?height=32&width=32"
                                        alt="User"
                                    />
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-56"
                            align="end"
                            forceMount
                        >
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        John Doe
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        john.doe@example.com
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <a href="/settings">Profile Settings</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href="/consultations">Appointments</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href="/settings">Support</a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Log out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <div className="flex flex-1">
                <Sidebar pathname={pathname} />
                <main className="flex-1">{props.children}</main>
            </div>
        </div>
    );
}
