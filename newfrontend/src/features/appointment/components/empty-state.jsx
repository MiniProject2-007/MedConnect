import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, FileText } from "lucide-react";
import { Link } from "react-router";

export function EmptyState({ type }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                {type === "upcoming" ? (
                    <Calendar className="h-6 w-6 text-primary" />
                ) : (
                    <FileText className="h-6 w-6 text-primary" />
                )}
            </div>

            <h3 className="mt-4 text-lg font-medium">
                {type === "upcoming"
                    ? "No Upcoming Consultations"
                    : "No Past Consultations"}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
                {type === "upcoming"
                    ? "Schedule your next appointment with your doctor."
                    : "Your consultation history will appear here."}
            </p>

            {type === "upcoming" && (
                <Button className="mt-4 rounded-full" asChild>
                    <Link to="/dashboard/book-appointment">
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Appointment
                    </Link>
                </Button>
            )}
        </div>
    );
}
