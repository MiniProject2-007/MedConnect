"use client";

import HomePageCards from "@/components/home/HomePageCards";
import { HomePageCarousel } from "@/components/home/HomePageCaursel";
import HomePageHeader from "@/components/home/HomePageHeader";
import React from "react";

const HomePage = () => {
    return (
        <div className="flex flex-col md:pl-32 py-2  min-h-screen">
            <HomePageHeader/>
            <HomePageCarousel/>
            <HomePageCards/>
        </div>
    );
};

export default HomePage;
