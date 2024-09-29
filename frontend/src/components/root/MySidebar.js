"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Home,
    Users,
    Calendar,
    MessageSquare,
    FileText,
    Settings,
    Menu,
    LogOut,
    LayoutDashboardIcon,
} from "lucide-react";

const sidebarItems = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
    { name: "Patients", href: "/patients", icon: Users },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
];

export default function MySidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    if (pathname === "/" || pathname.includes("/meeting")) return null;
    return (
        <div
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            className={cn(
                "absolute  top-0 left-0 z-50 flex flex-col h-screen p-4 bg-white shadow-sm border-r  border-gray-200 transition-all duration-300 ease-in-out",
                isOpen ? "w-64" : "w-20 md:w-28"
            )}
        >
            <div className="flex items-center justify-center mb-8">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {/* Add your logo or user avatar here */}
                </div>
            </div>
            <ScrollArea className="flex-grow mt-8">
                <div className="space-y-4 ">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3  md:pl-2 rounded-lg transition-colors",
                                pathname === item.href && isOpen
                                    ? "bg-[#FF7F50] text-white"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <div
                                className={cn(
                                    "px-2 py-2 md:px-4 md:py-3 rounded-lg flex items-center justify-center",
                                    pathname === item.href
                                        ? "bg-[#FF7F50] text-white"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon className="w-7 h-7" />
                            </div>
                            <span
                                className={cn(
                                    "transition-opacity duration-300",
                                    isOpen ? "opacity-100" : "opacity-0"
                                )}
                            >
                                {item.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </ScrollArea>
            <div className="mt-auto">
                <Button
                    variant="ghost"
                    className="w-full justify-start space-x-4"
                >
                    <LogOut className="w-6 h-6" />
                    <span
                        className={cn(
                            "transition-opacity duration-300",
                            isOpen ? "opacity-100" : "opacity-0"
                        )}
                    >
                        Log out
                    </span>
                </Button>
            </div>
        </div>
    );
}
