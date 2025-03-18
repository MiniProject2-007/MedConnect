import React from "react";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LandingCTA() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

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
        <section
            id="contact"
            className=" text-center  py-20 bg-primary/5"
            ref={ref}
        >
            <div className="px-4 md:px-6">
                <motion.div
                    className="grid gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    <motion.div variants={itemVariants}>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Ready to Transform Your{" "}
                            <span className="text-primary">
                                Healthcare Experience?
                            </span>
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Join thousands of satisfied users who have made
                            HealthConnect their go-to healthcare platform. Sign
                            up today and experience the future of healthcare.
                        </p>
                        <div className="mt-8 items-center justify-center flex flex-col sm:flex-row gap-4">
                            <Button size="lg" asChild>
                                <Link>Get Started</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link>Learn More</Link>
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
