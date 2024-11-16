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
import { useDebounce } from "@/hooks/useDebounce";

const HomePageHeader = ({query}) => {
    const { getToken, userId } = useAuth();
    const router = useRouter();
    const [isDoctor, setIsDoctor] = useState(false);
    const [searchQuery, setSearchQuery] = useState(query);
    const debouncedQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        router.push(`?query=${debouncedQuery}`);
    }, [debouncedQuery]);

    const getIsDoctor = async () => {
        const token = await getToken();
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_MAIN_SERVER}/doctor/isDoctor`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        userid: userId,
                    },
                }
            );

            const data = await res.json();
            if (data.isDoctor) {
                localStorage.setItem("isDoctor", "true");
                setIsDoctor(true);
            } else {
                localStorage.setItem("isDoctor", "false");
                setIsDoctor(false);
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    };
    useEffect(() => {
        getIsDoctor();
    }, []);
    return (
        <header className="px-8 py-4">
            <div className="mx-auto flex items-center justify-between">
                <div className="relative w-full md:w-1/2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search for doctors, specialties, or conditions"
                        className="pl-10 pr-4 py-3 w-full border-[#FF7F50] focus:ring-[#FF7F50]"
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                </div>
            </div>
        </header>
    );
};

export default HomePageHeader;
