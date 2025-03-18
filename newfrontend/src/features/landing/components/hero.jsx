import React from "react"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, Video, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";

export function LandingHero() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleGetStarted = () => {
        toast.success("Welcome to HealthConnect!", {
            description: "Your journey to better healthcare begins now.",
            position: "top-center",
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2,
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

    const floatingAnimation = {
        y: ["-10px", "10px", "-10px"],
        transition: {
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            ease: "easeInOut",
        },
    };

    return (
        <section className="min-h-[80vh] relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 size-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute top-40 -left-20 size-60 rounded-full bg-primary/10 blur-3xl" />
            </div>

            <div className="relative px-4 md:px-6">
                <motion.div
                    className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    <motion.div
                        className="flex flex-col gap-6"
                        variants={itemVariants}
                    >
                        <motion.span
                            className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            Revolutionizing Healthcare
                        </motion.span>
                        <motion.h1
                            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
                            variants={itemVariants}
                        >
                            Your Health,{" "}
                            <span className="text-primary">Simplified</span>
                        </motion.h1>
                        <motion.p
                            className="max-w-[600px] text-lg text-muted-foreground md:text-xl"
                            variants={itemVariants}
                        >
                            Book appointments, chat with doctors, and manage
                            your health all in one place. HealthConnect makes
                            healthcare accessible, convenient, and personalized.
                        </motion.p>
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4"
                            variants={itemVariants}
                        >
                            <Button size="lg" onClick={handleGetStarted}>
                                Get Started
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link to="#how-it-works">
                                    See How It Works
                                </Link>
                            </Button>
                        </motion.div>

                        <motion.div
                            className="mt-6 flex flex-wrap items-center gap-4 text-sm"
                            variants={itemVariants}
                        >
                            <div className="flex items-center gap-1">
                                <svg
                                    className="size-4 fill-primary"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                >
                                    <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" />
                                </svg>
                                <span>Secure & Private</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <svg
                                    className="size-4 fill-primary"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                >
                                    <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" />
                                </svg>
                                <span>24/7 Support</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <svg
                                    className="size-4 fill-primary"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                >
                                    <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" />
                                </svg>
                                <span>Trusted by many patients</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="relative flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        {/* Main dashboard   */}
                        <motion.div
                            className="relative z-10 rounded-xl shadow-2xl overflow-hidden border"
                            animate={floatingAnimation}
                        >
                            {/* <img
                                src="/placeholder.svg?height=600&width=800"
                                alt="HealthConnect Dashboard"
                                width={600}
                                height={400}
                                className="w-full h-auto"
                            ></img> */}
                        </motion.div>

                        {/* Floating elements */}
                        <motion.div
                            className="absolute -top-10 -left-10 z-20 rounded-lg bg-white p-4 shadow-lg border"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 1 }}
                            whileHover={{
                                y: -5,
                                transition: { duration: 0.2 },
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-primary/10 p-2">
                                    <Calendar className="size-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        Next Appointment
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Today, 3:30 PM
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="absolute -bottom-8 left-20 z-20 rounded-lg bg-white p-4 shadow-lg border"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.3 }}
                            whileHover={{
                                y: -5,
                                transition: { duration: 0.2 },
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-primary/10 p-2">
                                    <MessageSquare className="size-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        New Message
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        From Dr. Smith
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="absolute top-20 -right-10 z-20 rounded-lg bg-white p-4 shadow-lg border"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 1.6 }}
                            whileHover={{
                                y: -5,
                                transition: { duration: 0.2 },
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-primary/10 p-2">
                                    <Video className="size-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        Video Consultation
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Ready to join
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Stats section */}
                {/* <motion.div
                    className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-8"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.8 }}
                >
                    <div className="rounded-lg border bg-card p-4 text-center">
                        <div className="text-3xl font-bold text-primary">
                            10k+
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Active Users
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 text-center">
                        <div className="text-3xl font-bold text-primary">
                            500+
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Doctors
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 text-center">
                        <div className="text-3xl font-bold text-primary">
                            98%
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Satisfaction
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 text-center">
                        <div className="text-3xl font-bold text-primary">
                            24/7
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Support
                        </div>
                    </div>
                </motion.div> */}
            </div>
        </section>
    );
}
