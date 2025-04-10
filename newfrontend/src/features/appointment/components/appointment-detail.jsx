import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Calendar,
    Clock,
    User,
    FileText,
    Video,
    MapPin,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowLeft,
    PenTool,
    Download,
    ChevronDown,
    ChevronUp,
    Mail,
    Phone,
    FileAudio,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { TranscriptDrawer } from "./transcript";

const getStatusColor = (status) => {
    switch (status) {
        case "pending":
            return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
        case "approved":
            return "bg-green-500/10 text-green-500 border-green-500/20";
        case "rejected":
            return "bg-red-500/10 text-red-500 border-red-500/20";
        case "completed":
            return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        case "cancelled":
            return "bg-gray-500/10 text-gray-500 border-gray-500/20";
        default:
            return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
};

const StatusIcon = ({ status }) => {
    switch (status) {
        case "pending":
            return <AlertCircle className="h-4 w-4" />;
        case "approved":
            return <CheckCircle className="h-4 w-4" />;
        case "rejected":
            return <XCircle className="h-4 w-4" />;
        case "completed":
            return <CheckCircle className="h-4 w-4" />;
        case "cancelled":
            return <XCircle className="h-4 w-4" />;
        default:
            return <AlertCircle className="h-4 w-4" />;
    }
};

const AppointmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        reason: true,
        summary: true,
    });
    const [generatingTranscript, setGeneratingTranscript] = useState(false);
    const [transcriptDrawerOpen, setTranscriptDrawerOpen] = useState(false);

    const { getToken } = useAuth();

    const getAppointment = async () => {
        console.log("Fetching appointment data...");
        setLoading(true);
        try {
            const res = await fetch(
                `${
                    import.meta.env.VITE_MAIN_SERVER_URL
                }/appointment/getAppointment/${id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${await getToken()}`,
                    },
                }
            );
            if (!res.ok) {
                throw new Error("Failed to fetch appointment data");
            }

            const data = await res.json();
            if (data.error) {
                throw new Error(data.error);
            }
            setAppointment(data);
        } catch (err) {
            console.error("Error fetching appointment data: ", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAppointment();
    }, [id]);

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), "MMMM d, yyyy");
        } catch (error) {
            return dateString;
        }
    };

    const formatTime = (dateString) => {
        try {
            return format(new Date(dateString), "h:mm a");
        } catch (error) {
            return dateString;
        }
    };

    const getPatientInitials = () => {
        if (!appointment?.patientInfo) return "?";
        return `${appointment.patientInfo.firstName.charAt(
            0
        )}${appointment.patientInfo.lastName.charAt(0)}`;
    };

    const getPatientFullName = () => {
        if (!appointment?.patientInfo) return "Unknown Patient";
        return `${appointment.patientInfo.firstName} ${appointment.patientInfo.lastName}`;
    };

    const getDoctorName = () => {
        if (!appointment?.doctorInfo) return "Doctor";
        return `Dr. ${appointment.doctorInfo.firstName} ${appointment.doctorInfo.lastName}`;
    };

    const getRecordTypeIcon = (recordType) => {
        switch (recordType) {
            case "prescription":
                return <FileText className="h-4 w-4 text-blue-500" />;
            case "report":
                return <FileText className="h-4 w-4 text-green-500" />;
            case "recording":
                return <Video className="h-4 w-4 text-purple-500" />;
            case "transcript":
                return <FileText className="h-4 w-4 text-orange-500" />;
            default:
                return <FileText className="h-4 w-4 text-gray-500" />;
        }
    };

    const generateTranscript = async () => {
        setGeneratingTranscript(true);
        try {
            const res = await fetch(
                `${
                    import.meta.env.VITE_MAIN_SERVER_URL
                }/transcript/generateTranscript/${appointment.slug}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${await getToken()}`,
                    },
                }
            );
            if (!res.ok) {
                throw new Error("Failed to generate transcript");
            }
            const data = await res.json();
            if (data.error) {
                throw new Error(data.error);
            }
            toast.success("Transcript generated successfully!");

            // Refresh appointment data to get updated transcript status
            getAppointment();
        } catch (error) {
            console.error("Error generating transcript:", error);
            toast.error("Failed to generate transcript. Please try again.");
        } finally {
            setGeneratingTranscript(false);
        }
    };

    const handleViewTranscript = () => {
        setTranscriptDrawerOpen(true);
    };

    if (!appointment) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg text-muted-foreground">
                    No appointment found.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-background border-b px-4 py-3 sticky top-0 z-10">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="rounded-full"
                        >
                            <ArrowLeft size={18} />
                        </Button>
                        <h1 className="text-xl font-semibold">
                            Appointment Details
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto py-6 px-4 md:px-6">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left column - Appointment details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Appointment header card */}
                            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12 border">
                                                <AvatarImage
                                                    src={`/placeholder.svg?height=40&width=40`}
                                                />
                                                <AvatarFallback>
                                                    {getPatientInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h2 className="text-xl font-semibold">
                                                    {getPatientFullName()}
                                                </h2>
                                                <p className="text-sm text-muted-foreground">
                                                    Patient ID:{" "}
                                                    {appointment.userId}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:items-end">
                                            <div
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium",
                                                    getStatusColor(
                                                        appointment.status
                                                    )
                                                )}
                                            >
                                                <StatusIcon
                                                    status={appointment.status}
                                                />
                                                <span className="capitalize">
                                                    {appointment.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                ID:{" "}
                                                {appointment._id.substring(
                                                    0,
                                                    8
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-primary/10 p-2 rounded-full">
                                                <Calendar
                                                    size={16}
                                                    className="text-primary"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Date
                                                </p>
                                                <p className="font-medium">
                                                    {formatDate(
                                                        appointment.date
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="bg-primary/10 p-2 rounded-full">
                                                <Clock
                                                    size={16}
                                                    className="text-primary"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Time
                                                </p>
                                                <p className="font-medium">
                                                    {appointment.timeSlot}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="bg-primary/10 p-2 rounded-full">
                                                {appointment.appointmentType ===
                                                "video" ? (
                                                    <Video
                                                        size={16}
                                                        className="text-primary"
                                                    />
                                                ) : (
                                                    <MapPin
                                                        size={16}
                                                        className="text-primary"
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Type
                                                </p>
                                                <p className="font-medium capitalize">
                                                    {
                                                        appointment.appointmentType
                                                    }{" "}
                                                    Consultation
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="bg-primary/10 p-2 rounded-full">
                                                <FileText
                                                    size={16}
                                                    className="text-primary"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Created
                                                </p>
                                                <p className="font-medium">
                                                    {formatDate(
                                                        appointment.createdAt
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Appointment type specific info */}
                                {appointment.appointmentType === "video" &&
                                    appointment.meeting && (
                                        <div className="bg-muted/50 border-t p-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div>
                                                    <h3 className="font-medium flex items-center gap-2">
                                                        <Video
                                                            size={16}
                                                            className="text-primary"
                                                        />
                                                        Video Meeting Details
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Meeting ID:{" "}
                                                        {
                                                            appointment.meeting
                                                                .slug
                                                        }{" "}
                                                        • Duration:{" "}
                                                        {
                                                            appointment.meeting
                                                                .duration
                                                        }{" "}
                                                        minutes
                                                    </p>
                                                </div>
                                                {!appointment.transcript ? (
                                                    <Button
                                                        className="gap-2 mt-2 sm:mt-0"
                                                        variant="outline"
                                                        onClick={
                                                            generateTranscript
                                                        }
                                                        disabled={
                                                            generatingTranscript
                                                        }
                                                    >
                                                        <FileAudio size={16} />
                                                        <span>
                                                            {generatingTranscript
                                                                ? "Generating..."
                                                                : "Generate Transcript"}
                                                        </span>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="gap-2 mt-2 sm:mt-0"
                                                        variant="outline"
                                                        onClick={
                                                            handleViewTranscript
                                                        }
                                                    >
                                                        <FileAudio size={16} />
                                                        <span>
                                                            View Transcript
                                                        </span>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>

                            {/* Reason for visit */}
                            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer"
                                    onClick={() => toggleSection("reason")}
                                >
                                    <h3 className="font-medium">
                                        Reason for Visit
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                    >
                                        {expandedSections.reason ? (
                                            <ChevronUp size={16} />
                                        ) : (
                                            <ChevronDown size={16} />
                                        )}
                                    </Button>
                                </div>
                                {expandedSections.reason && (
                                    <div className="px-4 pb-4">
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                                            {appointment.reason}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Medical Records */}
                            {appointment.records &&
                                appointment.records.length > 0 && (
                                    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                                        <div className="p-4">
                                            <h3 className="font-medium mb-3">
                                                Medical Records
                                            </h3>
                                            <div className="space-y-3">
                                                {appointment.records.map(
                                                    (record) => (
                                                        <div
                                                            key={record._id}
                                                            className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-primary/10 p-2 rounded-full">
                                                                    {getRecordTypeIcon(
                                                                        record.recordType
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">
                                                                        {
                                                                            record.name
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {formatDate(
                                                                            record.createdAt
                                                                        )}{" "}
                                                                        •{" "}
                                                                        {
                                                                            record.recordType
                                                                        }
                                                                        {record.description &&
                                                                            ` • ${record.description}`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
                                                                <Download
                                                                    size={16}
                                                                />
                                                            </Button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h3 className="font-medium">
                                            Whiteboard
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Last modified:{" "}
                                            {formatDate(
                                                appointment.whiteboard
                                                    ?.lastModified
                                            )}{" "}
                                            at{" "}
                                            {formatTime(
                                                appointment.whiteboard
                                                    ?.lastModified
                                            )}
                                        </p>
                                    </div>
                                    <Button
                                        className="gap-2"
                                        onClick={() => {
                                            window.open(
                                                `${import.meta.env.VITE_WHITEBOARD_URL}${appointment.slug}`,
                                                "_blank"
                                            );
                                        }}
                                    >
                                        <PenTool size={14} />
                                        <span>Open Whiteboard</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Appointment Summary */}
                            {appointment.summary && (
                                <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                                    <div
                                        className="p-4 flex items-center justify-between cursor-pointer"
                                        onClick={() => toggleSection("summary")}
                                    >
                                        <h3 className="font-medium">
                                            Appointment Summary
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                        >
                                            {expandedSections.summary ? (
                                                <ChevronUp size={16} />
                                            ) : (
                                                <ChevronDown size={16} />
                                            )}
                                        </Button>
                                    </div>
                                    {expandedSections.summary && (
                                        <div className="px-4 pb-4">
                                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                                {appointment.summary}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right column - Patient info and actions */}
                        <div className="space-y-6">
                            {/* Patient Information */}
                            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                                <div className="p-4 border-b">
                                    <h3 className="font-medium">
                                        Patient Information
                                    </h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            <User
                                                size={16}
                                                className="text-primary"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Full Name
                                            </p>
                                            <p className="font-medium">
                                                {getPatientFullName()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            <Mail
                                                size={16}
                                                className="text-primary"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Email
                                            </p>
                                            <p className="font-medium">
                                                {appointment.patientInfo?.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            <Phone
                                                size={16}
                                                className="text-primary"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Phone
                                            </p>
                                            <p className="font-medium">
                                                {appointment.patientInfo?.phone}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {appointment && appointment.transcript && (
                <TranscriptDrawer
                    open={transcriptDrawerOpen}
                    onOpenChange={setTranscriptDrawerOpen}
                    transcript={appointment.transcript}
                />
            )}
        </div>
    );
};

export default AppointmentDetail;
