"use client";

import React, { useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useRef } from "react";

const AnimatedSection = ({ children, className, id = "" }) => {
    const controls = useAnimation();
    const ref = useRef(null);

    const inView = useInView(ref, { once: false, amount: 0.3 });


    useEffect(() => {
        if (inView) {
            controls.start("visible");
        } else {
            controls.start("hidden");
        }
    }, [controls, inView]);

    return (
        <motion.section
            ref={ref}
            animate={controls}
            initial="hidden"
            variants={{
                visible: { opacity: 1, y: 0 },
                hidden: { opacity: 0, y: 50 },
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            id={id}
            className={className}
        >
            {children}
        </motion.section>
    );
};
export default AnimatedSection;
