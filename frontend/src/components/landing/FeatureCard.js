import React from "react";
import { CardContent, Card } from "@/components/ui/card";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function FeatureCard({ icon, title, description }) {

    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Card className="border-gray-200 hover:shadow-md transition-shadow duration-300">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                    <div className="text-gray-600">{icon}</div>
                    <h3 className="text-xl font-semibold text-gray-800">
                        {title}
                    </h3>
                    <p className="text-gray-600 text-center">{description}</p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
