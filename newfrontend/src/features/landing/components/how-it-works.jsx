import React from "react";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { Calendar, Video } from "lucide-react";

export function LandingHowItWorks() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    const steps = [
        {
            number: "01",
            title: "Create Your Account",
            description:
                "Sign up in minutes with a simple verification process to ensure your security.",
            icon: (
                <svg
                    className="size-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                </svg>
            ),
        },
        {
            number: "02",
            title: "Book Appointment",
            description:
                "Select a convenient time slot and book your appointment - in-person or virtual.",
            icon: <Calendar className="size-6 text-primary" />,
        },
        {
            number: "03",
            title: "Receive Care",
            description:
                "Connect with your doctor through video call or visit the clinic for your appointment.",
            icon: <Video className="size-6 text-primary" />,
        },
    ];

    return (
        <section id="how-it-works" className="py-20 bg-primary/5" ref={ref}>
            <div className="px-4 md:px-6 flex flex-col items-center justify-center w-full">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        How <span className="text-primary">HealthConnect</span>{" "}
                        Works
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                        Our simple four-step process makes healthcare accessible
                        to everyone, anytime, anywhere.
                    </p>
                </div>

                <motion.div
                    className="griditems-center w-fit"
                    initial={{ opacity: 0 }}
                    animate={
                        isInView
                            ? {
                                  opacity: 1,
                                  transition: { staggerChildren: 0.2 },
                              }
                            : {}
                    }
                >
                    <motion.div className="space-y-8 w-fit">
                        {steps.map((step, index) => (
                            <motion.div key={index} className="flex gap-4">
                                <div className="flex-shrink-0 flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary font-bold">
                                    {step.number}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        {step.icon}
                                        <h3 className="text-xl font-bold">
                                            {step.title}
                                        </h3>
                                    </div>
                                    <p className="text-muted-foreground">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
