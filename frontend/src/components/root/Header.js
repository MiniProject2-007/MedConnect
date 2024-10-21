"use client";
import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useAuth } from "@clerk/nextjs";
const Header = () => {
    const pathname = usePathname();
    const { userId } = useAuth();
    if (
        pathname === "/" ||
        pathname.includes("/meeting/live/") ||
        !userId ||
        pathname.includes("/auth") ||
        pathname.includes("whiteboard")
    )
        return null;
    return (
        <div className="flex items-center justify-between bg-white shadow-sm p-4 md:hidden">
            <Menu
                size="32"
                className="text-[#FF7F50] cursor-pointer"
                onClick={() => {
                    const sidebar = document.getElementById("sidebar");
                    sidebar.classList.toggle("-translate-x-[100%]");
                }}
            />
        </div>
    );
};

export default Header;
