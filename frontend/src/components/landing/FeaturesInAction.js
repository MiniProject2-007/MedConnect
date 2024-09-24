import React from "react";
import { motion } from "framer-motion";

const FeaturesInAction = () => {
    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0, y: 100 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.3,
                when: "beforeChildren",
                staggerChildren: 0.25, // Increased stagger for more fluidity
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.85, rotate: -2 },
        visible: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94], // Ease for more natural motion
            },
        },
    };

    const imageVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1.05, // Slight scaling on load for emphasis
            transition: {
                duration: 0.8,
                ease: "easeOut", // Smooth easing for image appearance
            },
        },
        hover: {
            scale: 1.1, // Scale up on hover
            transition: {
                duration: 0.4,
            },
        },
    };

    return (
        <section
            id="features-in-action"
            className="w-full py-12 md:py-24 lg:py-32 bg-white"
        >
            <motion.div
                className="container px-4 md:px-6 mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Section Title */}
                <motion.h2
                    className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-gray-900"
                    variants={itemVariants}
                >
                    Features in Action
                </motion.h2>

                {/* Grid Layout for Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Real-time Consultation Feature */}
                    <motion.div
                        className="flex flex-col justify-center"
                        variants={itemVariants}
                    >
                        <h3 className="text-xl font-semibold text-gray-900">
                            Real-time Consultation
                        </h3>
                        <p className="text-gray-600 mt-4">
                            Watch how medical professionals can seamlessly
                            conduct video consultations and share files in
                            real-time.
                        </p>
                    </motion.div>

                    {/* Real-time Consultation Image */}
                    <motion.img
                        src="https://via.placeholder.com/600x400.png?text=Demo+Consultation"
                        alt="Real-time Consultation"
                        className="rounded-lg shadow-lg"
                        variants={imageVariants}
                        whileHover="hover" // Image scaling on hover
                    />

                    {/* Collaborative Whiteboards Image */}
                    <motion.img
                        src="https://via.placeholder.com/600x400.png?text=Demo+Whiteboard"
                        alt="Collaborative Whiteboards"
                        className="rounded-lg shadow-lg"
                        variants={imageVariants}
                        whileHover="hover"
                    />

                    {/* Collaborative Whiteboards Feature */}
                    <motion.div
                        className="flex flex-col justify-center"
                        variants={itemVariants}
                    >
                        <h3 className="text-xl font-semibold text-gray-900">
                            Collaborative Whiteboards
                        </h3>
                        <p className="text-gray-600 mt-4">
                            Learn how you can brainstorm ideas, explain
                            concepts, and make real-time annotations on our
                            interactive whiteboards.
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
};

export default FeaturesInAction;
