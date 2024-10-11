import Doctors from "@/components/home/Doctors";
import { HomePageCarousel } from "@/components/home/HomePageCaursel";
import HomePageHeader from "@/components/home/HomePageHeader";
import React from "react";

const HomePage = () => {
    return (
        <div className="flex flex-col md:pl-32 py-2  min-h-screen">
            <HomePageHeader />
            <HomePageCarousel />
            <Doctors />
        </div>
    );
};

export default HomePage;
