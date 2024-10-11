import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { User, MessageSquare, Calendar } from "lucide-react";
import BookAppointment from "../appointments/BookAppointment";



const DoctorCard = ({doctor}) => {
    return (
        <Card
            key={doctor._id}
            className="overflow-hidden transition-all duration-300 hover:shadow-lg"
        >
            <CardContent className="p-0">
                <div className="h-48 bg-gradient-to-br from-[#FF7F50] to-[#FF6347] flex items-center justify-center">
                    <User className="w-24 h-24 text-white" />
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{`${doctor.firstName} ${doctor.lastName}`}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                        {doctor.specialization}
                    </p>
                    <p className="text-xs text-gray-500">{`${doctor.experience} years of experience`}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {doctor.qualifications}
                    </p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between p-4 bg-gray-50">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                </Button>
                <BookAppointment doctor={doctor} />
            </CardFooter>
        </Card>
    );
};

export default DoctorCard;
