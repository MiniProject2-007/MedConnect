"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const carouselItems = [
    {
        title: "Book Your Appointment",
        description: "Easy and quick online booking for your medical needs",
        image: "/Appoinment.png",
        cta: "Book Now",
    },
    {
        title: "Expert Doctors",
        description: "Consult with our team of experienced specialists",
        image: "/Expert.png",
        cta: "Find a Doctor",
    },
    {
        title: "24/7 Support",
        description: "Round-the-clock assistance for your health concerns",
        image: "/24Support.png",
        cta: "Contact Us",
    },
    {
        title: "Telemedicine Services",
        description: "Get medical advice from the comfort of your home",
        image: "/telemedicine.png",
        cta: "Start Consultation",
    },
];

export function HomePageCarousel() {
    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    );

    return (
        <Carousel
            plugins={[plugin.current]}
            className="w-full mx-auto max-w-[96%] "
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
        >
            <CarouselContent>
                {carouselItems.map((item, index) => (
                    <CarouselItem key={index}>
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="border-none shadow-lg">
                                <CardContent className="p-0">
                                    <div className="relative aspect-[25/15] md:aspect-[25/8] overflow-hidden rounded-lg">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            width={1920}
                                            height={1080}
                                            className="transition-transform duration-300  h-full"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-0 left-0 p-6 text-white">
                                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                                                {item.title}
                                            </h2>
                                            <p className="text-xs sm:text-sm md:text-base mb-4">
                                                {item.description}
                                            </p>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="bg-[#FF7F50] text-white hover:bg-[#FF6347] transition-colors"
                                                onClick={() => {
                                                    document
                                                        .getElementById(
                                                            "doctors"
                                                        )
                                                        .scrollIntoView({
                                                            behavior: "smooth",
                                                        });
                                                }}
                                            >
                                                {item.cta}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <div className="hidden md:block">
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white" />
            </div>
        </Carousel>
    );
}
