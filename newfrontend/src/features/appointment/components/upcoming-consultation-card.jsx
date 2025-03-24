import React from "react";
import { Button } from "@/components/ui/button";
import ConsultationCard from "./consultation-card";
import { Calendar, Video, X } from "lucide-react";

export function UpcomingConsultationCard({ consultation }) {
    return (
        <ConsultationCard consultation={consultation}>
            {consultation.appointmentType === "video" &&
                consultation.status === "confirmed" && (
                    <Button className="h-9 gap-1 rounded-full" size="sm">
                        <Video className="h-3.5 w-3.5" />
                        Join Video Call
                    </Button>
                )}


            <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
                <X className="h-3.5 w-3.5" />
                Cancel
            </Button>
        </ConsultationCard>
    );
}
