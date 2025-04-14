import React from "react";
import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export function LandingTestimonials() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    const [currentIndex, setCurrentIndex] = useState(0);

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Patient",
            image: "/placeholder.svg?height=80&width=80",
            content:
                "This platform has made it incredibly easy for me to consult the doctor without traveling. I can ask questions anytime and get prescriptions directly on my phone.",
            rating: 5,
        },
        {
            name: "Michael Chen",
            role: "Patient",
            image: "/placeholder.svg?height=80&width=80",
            content:
                "I love how organized everything is. All my medical history, prescriptions, and reports are saved in one place. It's stress-free and super convenient.",
            rating: 5,
        },
        {
            name: "Aarav Mehta",
            role: "Patient",
            image: "/placeholder.svg?height=80&width=80",
            content:
                "I booked an appointment in less than a minute and had a video call with the doctor from home. Amazing experience and very professional service!",
            rating: 5,
        },
        {
            name: "Priya Sharma",
            role: "Patient",
            image: "/placeholder.svg?height=80&width=80",
            content:
                "Being able to send reports and chat with the doctor in real-time has been a blessing. It feels like personal care without the hospital visit.",
            rating: 4,
        },
        {
            name: "Rohan Desai",
            role: "Patient",
            image: "/placeholder.svg?height=80&width=80",
            content:
                "The platform reminded me of my follow-up visit, and I didn’t miss it this time! Everything is smooth, and the video call quality is excellent.",
            rating: 5,
        },
    ];

    const visibleTestimonials = testimonials.slice(
        currentIndex,
        currentIndex + 3
    );

    const handlePrevious = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => Math.min(testimonials.length - 3, prev + 1));
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
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

    return (
        <section id="testimonials" className="py-20 bg-background" ref={ref}>
            <div className="px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        What Our{" "}
                        <span className="text-primary">Patients Say</span>
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                        Don’t just take our word for it. Here's what our
                        patients say about their experience with our platform.
                    </p>
                </div>

                <div className="relative">
                    <motion.div
                        className="grid gap-6 md:grid-cols-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                    >
                        {visibleTestimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{
                                    y: -10,
                                    transition: { duration: 0.2 },
                                }}
                            >
                                <Card className="h-full">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-5 w-5 ${
                                                        i < testimonial.rating
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-muted-foreground"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="mb-6 text-muted-foreground">
                                            "{testimonial.content}"
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage
                                                    src={testimonial.image}
                                                    alt={testimonial.name}
                                                />
                                                <AvatarFallback>
                                                    {testimonial.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">
                                                    {testimonial.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {testimonial.role}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="flex justify-center mt-10 gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className="rounded-full"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleNext}
                            disabled={currentIndex >= testimonials.length - 3}
                            className="rounded-full"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
