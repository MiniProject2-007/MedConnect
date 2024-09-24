import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function TestimonialCard({ quote, name, title }) {
    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Card className="border-gray-200 hover:shadow-md transition-shadow duration-300">
                <CardContent className="flex flex-col space-y-4 p-6">
                    <p className="text-gray-600 italic">"{quote}"</p>
                    <div className="flex items-center space-x-4">
                        <Avatar>
                            <AvatarImage
                                src="/placeholder-avatar.jpg"
                                alt={name}
                            />
                            <AvatarFallback>{name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium text-gray-800">
                                {name}
                            </p>
                            <p className="text-xs text-gray-600">{title}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
