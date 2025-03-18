import React from "react"
import { useRef } from "react";
import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function LandingPricing() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    const plans = [
        {
            name: "Basic",
            description: "Essential healthcare services for individuals",
            price: "$9.99",
            period: "per month",
            features: [
                "Unlimited in-app messaging",
                "Book up to 2 appointments/month",
                "Access to digital prescriptions",
                "24/7 customer support",
            ],
            popular: false,
            buttonText: "Get Started",
            buttonVariant: "outline",
        },
        {
            name: "Pro",
            description:
                "Comprehensive healthcare for individuals and families",
            price: "$19.99",
            period: "per month",
            features: [
                "All Basic features",
                "Unlimited video consultations",
                "Priority appointment booking",
                "Family accounts (up to 4 members)",
                "Health records management",
                "Prescription delivery",
            ],
            popular: true,
            buttonText: "Get Started",
            buttonVariant: "default",
        },
        {
            name: "Enterprise",
            description: "Custom healthcare solutions for organizations",
            price: "Custom",
            period: "contact for pricing",
            features: [
                "All Pro features",
                "Dedicated account manager",
                "Custom integration options",
                "Employee health analytics",
                "Bulk appointment scheduling",
                "API access",
            ],
            popular: false,
            buttonText: "Contact Sales",
            buttonVariant: "outline",
        },
    ];

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
        <section id="pricing" className="py-20 bg-primary/5" ref={ref}>
            <div className="px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Simple, Transparent{" "}
                        <span className="text-primary">Pricing</span>
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                        Choose the plan that works best for you. All plans
                        include a 14-day free trial.
                    </p>
                </div>

                <motion.div
                    className="grid gap-6 md:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            className="relative"
                            variants={itemVariants}
                            whileHover={{
                                y: -10,
                                transition: { duration: 0.2 },
                            }}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-primary px-3 py-1 text-center text-xs font-medium text-primary-foreground">
                                    Most Popular
                                </div>
                            )}
                            <div
                                className={`h-full border p-6 rounded-lg shadow-md ${
                                    plan.popular
                                        ? "border-primary shadow-lg"
                                        : ""
                                }`}
                            >
                                <div>
                                    <h3 className="text-xl font-semibold">
                                        {plan.name}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {plan.description}
                                    </p>
                                    <div className="mt-4">
                                        <span className="text-4xl font-bold">
                                            {plan.price}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {" "}
                                            {plan.period}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, i) => (
                                            <li
                                                key={i}
                                                className="flex items-center gap-2"
                                            >
                                                <Check className="h-5 w-5 text-primary" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-4">
                                    <button
                                        className={`w-full py-2 px-4 rounded-md font-medium ${
                                            plan.buttonVariant === "default"
                                                ? "bg-primary text-white"
                                                : "border border-primary text-primary"
                                        }`}
                                    >
                                        {plan.buttonText}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="mt-16 text-center">
                    <p className="text-muted-foreground">
                        Need a custom solution?{" "}
                        <a
                            href="#contact"
                            className="text-primary font-medium hover:underline"
                        >
                            Contact our sales team
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
}
