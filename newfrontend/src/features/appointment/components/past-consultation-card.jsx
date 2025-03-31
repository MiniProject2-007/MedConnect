import React from "react";
import { Button } from "@/components/ui/button";
import ConsultationCard from "./consultation-card";
import { Download, FileCheck, FileText } from "lucide-react";

export function PastConsultationCard({ consultation }) {
    return (
        <ConsultationCard consultation={consultation}>
            <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1 rounded-full"
            >
                <FileCheck className="h-3.5 w-3.5" />
                View Details
            </Button>

            {consultation.prescriptions && (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1 rounded-full"
                >
                    <Download className="h-3.5 w-3.5" />
                    Download Prescription
                </Button>
            )}

            {consultation.reports && (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1 rounded-full"
                >
                    <FileCheck className="h-3.5 w-3.5" />
                    View Reports
                </Button>
            )}
        </ConsultationCard>
    );
}
