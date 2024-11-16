import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { User, Star } from "lucide-react";
import BookAppointment from "../appointments/BookAppointment";
import DoctorRatings from "./DoctorRatings";

const DoctorCard = ({ doctor }) => {
    return (
        <Card
            key={doctor._id}
            className="overflow-hidden transition-all duration-300 hover:shadow-lg"
        >
            <CardContent className="p-0">
                <div className="h-48 flex items-center justify-center border-b">
                    <User className="w-32 h-32 text-gray-400" />
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
                <DoctorRatings doctor={doctor} />
                <BookAppointment doctor={doctor} />
            </CardFooter>
        </Card>
    );
};

export default DoctorCard;
