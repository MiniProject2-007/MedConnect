"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, MessageSquare, FileText, Pen } from "lucide-react";
import { motion } from "framer-motion";
import FeatureCard from "@/components/landing/FeatureCard";
import StepCard from "@/components/landing/StepCard";
import TestimonialCard from "@/components/landing/TestinomalCard";
import AnimatedSection from "@/components/HOC/AnimatedSection";
import StatCard from "@/components/landing/StatCard";
import { useRouter } from "next/navigation";
import FeaturesInAction from "@/components/landing/FeaturesInAction";
import TypingAnimation from "@/components/magicui/typing-animation";
export default function LandingPage() {
    const router = useRouter();
    return (
        <div className="flex flex-col min-h-screen bg-white ">
            <motion.header
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="px-4 lg:px-6 py-4 flex items-center z-50 sticky top-0 bg-white border-b border-gray-200"
            >
                <div className="flex items-center justify-between w-full">
                    <div className="text-2xl font-bold text-gray-800">
                        Med<span className="text-[#FF7F50]">Connect</span>
                    </div>
                    <nav className="hidden md:flex gap-4 sm:gap-6 ">
                        <a
                            className="text-sm font-medium hover:text-[#FF7F50] transition-colors"
                            href="#features"
                        >
                            Features
                        </a>
                        <a
                            className="text-sm font-medium hover:text-[#FF7F50] transition-colors"
                            href="#how-it-works"
                        >
                            How It Works
                        </a>
                        <a
                            className="text-sm font-medium hover:text-[#FF7F50] transition-colors"
                            href="#testimonials"
                        >
                            Testimonials
                        </a>
                    </nav>
                    <div className=" gap-4 hidden md:flex">
                        <Button
                            variant="outline"
                            className="border-gray-300 text-gray-600 hover:bg-gray-50"
                            onClick={() => {
                                router.push("/auth/login");
                            }}
                        >
                            Log In
                        </Button>
                        <Button
                            className="bg-[#FF7F50] text-white hover:bg-[#FF6347]"
                            onClick={() => {
                                router.push("/auth/signup");
                            }}
                        >
                            Sign Up
                        </Button>
                    </div>
                </div>
            </motion.header>
            <main className="flex-1">
                <AnimatedSection className="w-full bg-hero-pattern bg-cover bg-center bg-no-repeat bg-blend-color-burn">
                    <div className="py-12 md:py-24 lg:py-32 xl:py-48 w-full h-full bg-white/60">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <TypingAnimation
                                text={"Connect, Consult, Collaborate"}
                                duration={100}
                            />
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="mx-auto max-w-[700px] text-gray-600 md:text-xl"
                            >
                                Empowering medical professionals and patients
                                with seamless communication and collaboration
                                tools.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="space-x-4"
                            >
                                <Button
                                    size="lg"
                                    className="bg-[#FF7F50] text-white hover:bg-[#FF6347]"
                                    onClick={() => {
                                        router.push("/auth/signup");
                                    }}
                                >
                                    Get Started
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                                    onClick={() => {
                                        router.push("/auth/login");
                                    }}
                                >
                                    Learn More
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </AnimatedSection>
                <AnimatedSection
                    id="features"
                    className="w-full py-12 md:py-24 lg:py-32"
                >
                    <div className="container px-4 md:px-6 mx-auto">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-gray-900">
                            Key Features
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FeatureCard
                                icon={
                                    <Video className="h-10 w-10 text-[#FF7F50]" />
                                }
                                title="Live Video Consultations"
                                description="Connect face-to-face with patients or colleagues in high-quality video calls."
                            />
                            <FeatureCard
                                icon={
                                    <MessageSquare className="h-10 w-10 text-[#FF7F50]" />
                                }
                                title="Real-time Chat"
                                description="Instant messaging for quick communication and follow-ups."
                            />
                            <FeatureCard
                                icon={
                                    <FileText className="h-10 w-10 text-[#FF7F50]" />
                                }
                                title="Secure File Sharing"
                                description="Share and access medical records, test results, and other documents securely."
                            />
                            <FeatureCard
                                icon={
                                    <Pen className="h-10 w-10 text-[#FF7F50]" />
                                }
                                title="Collaborative Whiteboards"
                                description="Visualize ideas and explain concepts with interactive whiteboards."
                            />
                        </div>
                    </div>
                </AnimatedSection>
                <AnimatedSection
                    id="how-it-works"
                    className="w-full py-12 md:py-24 lg:py-32 bg-white"
                >
                    <div className="container px-4 md:px-6 mx-auto">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-gray-900">
                            How It Works
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <StepCard
                                number={1}
                                title="Sign Up"
                                description="Create your account as a medical professional or patient."
                            />
                            <StepCard
                                number={2}
                                title="Connect"
                                description="Find and connect with other professionals or patients."
                            />
                            <StepCard
                                number={3}
                                title="Collaborate"
                                description="Start consultations, share files, and work together seamlessly."
                            />
                        </div>
                    </div>
                </AnimatedSection>
                <AnimatedSection
                    id="testimonials"
                    className="w-full py-12 md:py-24 lg:py-32 bg-gray-50"
                >
                    <div className="container px-4 md:px-6 mx-auto">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-gray-900">
                            What Our Users Say
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <TestimonialCard
                                quote="This platform has revolutionized how I collaborate with colleagues and interact with patients. The video consultations and file sharing features are game-changers."
                                name="Dr. Sarah Johnson"
                                title="Cardiologist"
                            />
                            <TestimonialCard
                                quote="I love how easy it is to connect with my doctors and access my medical information. The platform is user-friendly and has greatly improved my healthcare experience."
                                name="Michael Thompson"
                                title="Patient"
                            />
                        </div>
                    </div>
                </AnimatedSection>
                <AnimatedSection
                    id="features-in-action"
                    className="w-full py-12 md:py-24 lg:py-32 bg-white"
                >
                    <FeaturesInAction />
                </AnimatedSection>
                <AnimatedSection className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900"
                            >
                                Ready to Transform Your Healthcare
                                Communication?
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="mx-auto max-w-[700px] text-gray-600 md:text-xl"
                            >
                                Join our platform today and experience the
                                benefits of seamless, secure collaboration.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="w-full max-w-sm space-y-2"
                            >
                                <form className="flex space-x-2">
                                    <Input
                                        className="flex-1 bg-white border-gray-300 focus:ring-2 focus:ring-[#FF7F50]"
                                        placeholder="Enter your email"
                                        type="email"
                                    />
                                    <Button
                                        type="submit"
                                        className="bg-[#FF7F50] text-white hover:bg-[#FF6347]"
                                    >
                                        Get Started
                                    </Button>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </AnimatedSection>
            </main>
            <motion.footer
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200"
            >
                <p className="text-xs text-gray-600">
                    © {new Date().getFullYear()} MedConnect. All rights
                    reserved.
                </p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <a
                        className="text-xs hover:underline underline-offset-4 text-gray-600 hover:text-[#FF7F50]"
                        href="#"
                    >
                        Terms of Service
                    </a>
                    <a
                        className="text-xs hover:underline underline-offset-4 text-gray-600 hover:text-[#FF7F50]"
                        href="#"
                    >
                        Privacy
                    </a>
                </nav>
            </motion.footer>
        </div>
    );
}
