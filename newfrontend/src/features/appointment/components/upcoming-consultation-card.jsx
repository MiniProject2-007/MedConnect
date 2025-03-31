import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import ConsultationCard from "./consultation-card";
import { Calendar, Check, Video, X } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function UpcomingConsultationCard({ consultation, refetch }) {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("doctorToken");
    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(
                `${
                    import.meta.env.VITE_MAIN_SERVER_URL
                }/doctor/approveAppointment/${consultation._id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: token,
                    },
                }
            );
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to confirm appointment");
            }
            toast.success("Appointment confirmed successfully");
            refetch();
        } catch (err) {
            console.error(err);
            toast.error("Error confirming appointment");
        }finally{
            setIsLoading(false);
        }
    };
    return (
        <ConsultationCard consultation={consultation}>
            {consultation.appointmentType === "video" &&
                consultation.status === "approved" && (
                    <Button
                        className="h-9 gap-1 rounded-full"
                        size="sm"
                        onClick={() => {
                            navigate(
                                `/dashboard/meeting/join/${consultation.meeting.slug}`
                            );
                        }}
                    >
                        <Video className="h-3.5 w-3.5" />
                        Join Video Call
                    </Button>
                )}

            {token && consultation.status === "pending" && (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 rounded-full cursor-pointer"
                    onClick={handleConfirm}
                    disabled={isLoading}
                >
                    <Check className="h-3.5 w-3.5" />
                    Confirm Appointment
                </Button>
            )}
        </ConsultationCard>
    );
}
