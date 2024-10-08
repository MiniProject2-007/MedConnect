import Appointments from "@/components/appointments/Appointments";
import React from "react";

const AppointmentsPage = () => {
    return (
        <div className="flex flex-col md:pl-32 py-2  min-h-screen ">
            <Appointments />
        </div>
    );
};

export default AppointmentsPage;
