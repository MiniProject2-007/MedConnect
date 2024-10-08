'use client';
import { Menu } from "lucide-react";
import React from "react";

const Header = () => {
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
