import React from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    Clock,
    Video,
    MapPin,
    FileText,
    CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

function ConsultationCard({ consultation, children }) {
    const isPast = "summary" in consultation;

    const formattedDate = (() => {
        try {
            const date = parseISO(consultation.date);
            return format(date, "MMMM d, yyyy");
        } catch {
            return consultation.date;
        }
    })();

    const displayStatus = capitalize(consultation.status);

    const getStatusColor = (status) => {
        const statusLower = status.toLowerCase();
        if (statusLower === "completed") return "bg-blue-500";
        if (statusLower === "approved") return "bg-green-500";
        if (statusLower === "pending") return "bg-amber-500";
        return "bg-red-500";
    };

    const getStatusBadgeStyle = (status) => {
        const statusLower = status.toLowerCase();
        if (statusLower === "completed")
            return "bg-blue-50 text-blue-700 border-blue-200";
        if (statusLower === "approved")
            return "bg-green-50 text-green-700 border-green-200";
        if (statusLower === "pending")
            return "bg-amber-50 text-amber-700 border-amber-200";
        return "bg-red-50 text-red-700 border-red-200";
    };

    return (
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-muted/80">
            <div className="relative">
                <div
                    className={cn(
                        "absolute left-0 top-0 h-full w-1.5 transition-colors",
                        getStatusColor(consultation.status)
                    )}
                />

                <CardContent className="p-5 pl-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-4">
                            {/* Appointment Header */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                                    <CalendarClock className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-base leading-tight">
                                        Appointment
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {capitalize(
                                            consultation.appointmentType
                                        )}{" "}
                                        Consultation
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/5">
                                        <Calendar className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <span className="text-foreground/90">
                                        {formattedDate}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/5">
                                        <Clock className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <span className="text-foreground/90">
                                        {consultation.timeSlot}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm mt-1 ">
                                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/5 mt-0.5">
                                        <FileText className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <div className="w-fit h-fit">
                                        <span className="font-medium text-foreground">
                                            Reason:
                                        </span>{" "}
                                        <span className="text-foreground/90">
                                            {consultation.reason}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-start gap-3 sm:items-end">
                            <Badge
                                variant={
                                    consultation.appointmentType === "video"
                                        ? "default"
                                        : "outline"
                                }
                                className={cn(
                                    "rounded-full px-3 py-1.5 font-medium text-xs transition-colors",
                                    consultation.appointmentType === "video"
                                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                                        : ""
                                )}
                            >
                                {consultation.appointmentType === "video" ? (
                                    <Video className="mr-1.5 h-3 w-3" />
                                ) : (
                                    <MapPin className="mr-1.5 h-3 w-3" />
                                )}
                                {capitalize(consultation.appointmentType)}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={cn(
                                    "rounded-full px-3 py-1.5 font-medium text-xs transition-colors",
                                    getStatusBadgeStyle(consultation.status)
                                )}
                            >
                                {displayStatus}
                            </Badge>

                            {consultation.meetingId &&
                                consultation.status.toLowerCase() ===
                                    "pending" && (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Meeting ID: {consultation.meetingId}
                                    </div>
                                )}
                        </div>
                    </div>

                    {isPast && consultation.summary && (
                        <div className="mt-5 rounded-lg bg-muted/30 p-4 border border-muted">
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                    Summary:
                                </span>{" "}
                                {consultation.summary}
                            </p>
                        </div>
                    )}

                    {children && (
                        <div className="mt-5 flex flex-wrap gap-2">
                            {children}
                        </div>
                    )}
                </CardContent>
            </div>
        </Card>
    );
}

export default ConsultationCard;
