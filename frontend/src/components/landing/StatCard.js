import React from "react";
import { motion } from "framer-motion";

const StatCard = ({ value, label }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm"
    >
        <span className="text-4xl font-bold text-gray-800">{value}</span>
        <span className="text-gray-600 mt-2">{label}</span>
    </motion.div>
);

export default StatCard;
