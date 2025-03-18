import React from "react"
import { useRef } from "react";
import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import {
    Calendar,
    Video,
    MessageSquare,
    FileText,
    Bell,
    Shield,
    Clock,
    Smartphone,
} from "lucide-react";
import { toast } from "sonner";

export function LandingFeatures() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    const features = [
        {
            icon: Calendar,
            title: "Easy Scheduling",
            description:
                "Book appointments with your preferred doctors in just a few clicks, anytime and anywhere.",
            color: "bg-blue-100 dark:bg-blue-900/30",
            textColor: "text-blue-600 dark:text-blue-300",
        },
        {
            icon: Video,
            title: "Video Consultations",
            description:
                "Connect with healthcare professionals through secure video calls from the comfort of your home.",
            color: "bg-purple-100 dark:bg-purple-900/30",
            textColor: "text-purple-600 dark:text-purple-300",
        },
        {
            icon: MessageSquare,
            title: "Secure Messaging",
            description:
                "Communicate directly with your doctor through our encrypted messaging system.",
            color: "bg-green-100 dark:bg-green-900/30",
            textColor: "text-green-600 dark:text-green-300",
        },
        {
            icon: FileText,
            title: "Digital Prescriptions",
            description:
                "Receive and access your prescriptions digitally, with automatic reminders for refills.",
            color: "bg-amber-100 dark:bg-amber-900/30",
            textColor: "text-amber-600 dark:text-amber-300",
        },
        {
            icon: Bell,
            title: "Smart Reminders",
            description:
                "Never miss an appointment with personalized notifications and reminders.",
            color: "bg-red-100 dark:bg-red-900/30",
            textColor: "text-red-600 dark:text-red-300",
        },
        {
            icon: Shield,
            title: "Privacy Focused",
            description:
                "Your health data is encrypted and secure, meeting the highest privacy standards.",
            color: "bg-indigo-100 dark:bg-indigo-900/30",
            textColor: "text-indigo-600 dark:text-indigo-300",
        },
        {
            icon: Clock,
            title: "24/7 Availability",
            description:
                "Access healthcare services around the clock, including emergency consultations.",
            color: "bg-teal-100 dark:bg-teal-900/30",
            textColor: "text-teal-600 dark:text-teal-300",
        },
        {
            icon: Smartphone,
            title: "Mobile Access",
            description:
                "Manage your healthcare on the go with our responsive web app and mobile application.",
            color: "bg-pink-100 dark:bg-pink-900/30",
            textColor: "text-pink-600 dark:text-pink-300",
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5 },
        },
    };

    const handleFeatureClick = (title) => {
        toast.success(`Feature "${title}" is coming soon!`);
    };

    return (
        <section id="features" className="py-20 bg-background" ref={ref}>
            <div className="px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Comprehensive Features for{" "}
                        <span className="text-primary">Modern Healthcare</span>
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                        Our platform offers everything you need to manage your
                        healthcare journey efficiently and effectively.
                    </p>
                </div>

                <motion.div
                    className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="group relative overflow-hidden rounded-lg border bg-background p-6 transition-all hover:shadow-lg cursor-pointer"
                            variants={itemVariants}
                            whileHover={{
                                y: -5,
                                transition: { duration: 0.2 },
                            }}
                            onClick={() => handleFeatureClick(feature.title)}
                        >
                            <div
                                className={`absolute right-0 top-0 size-20 translate-x-8 -translate-y-8 transform rounded-full ${feature.color} opacity-20 transition-transform group-hover:translate-x-6 group-hover:-translate-y-6`}
                            />

                            <div
                                className={`mb-4 inline-flex size-12 items-center justify-center rounded-lg ${feature.color}`}
                            >
                                <feature.icon
                                    className={`size-6 ${feature.textColor}`}
                                />
                            </div>

                            <h3 className="mb-2 text-xl font-bold">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
