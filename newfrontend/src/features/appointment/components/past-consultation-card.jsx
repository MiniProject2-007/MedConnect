import React from "react";
import { Button } from "@/components/ui/button";
import ConsultationCard from "./consultation-card";
import { Download, FileCheck, FileText } from "lucide-react";
import { useNavigate } from "react-router";

export function PastConsultationCard({ consultation }) {
    const navigate = useNavigate();
    return (
        <ConsultationCard consultation={consultation}>
            <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1 rounded-full"
                onClick={() => {
                    navigate(`/dashboard/appointment/${consultation._id}`);
                }}
            >
                <FileCheck className="h-3.5 w-3.5" />
                View Details
            </Button>
        </ConsultationCard>
    );
}
