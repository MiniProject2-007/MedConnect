"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

const HomePageHeader = () => {
    const { getToken, userId } = useAuth();
    const router = useRouter();
    const [isDoctor, setIsDoctor] = useState(true);
    const getIsDoctor = async () => {
        const token = await getToken();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_MAIN_SERVER}/doctor/isDoctor`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    userid: userId,
                },
            });

            const data = await res.json();
            if (data.isDoctor) {
                localStorage.setItem("isDoctor", "true");
                return true;
            } else {
                localStorage.setItem("isDoctor", "false");
                return false;
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    };
    useEffect(async () => {
        setIsDoctor(await getIsDoctor())
    },[]);
    return (
        <header className="px-8 py-4">
            <div className="mx-auto flex items-center justify-between">
                <div className="relative w-full md:w-1/2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search for doctors, specialties, or conditions"
                        className="pl-10 pr-4 py-3 w-full border-[#FF7F50] focus:ring-[#FF7F50]"
                    />
                </div>

                <div className="flex items-center space-x-4">
                    {!isDoctor && (
                        <Button
                            variant="outline"
                            className="hidden md:inline-flex border-[#FF7F50] text-[#FF7F50] hover:bg-[#FF7F50] hover:text-white"
                            onClick={() => {
                                router.push("/auth/doctorsignin");
                            }}
                        >
                            Sign In as Doctor
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Bell
                                    className="h-5 w-5 -mr-10 md:mr-0"
                                    color="#FF7F50"
                                />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                New message from Dr. Smith
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                Appointment reminder: Tomorrow at 10 AM
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                Your test results are ready
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default HomePageHeader;
