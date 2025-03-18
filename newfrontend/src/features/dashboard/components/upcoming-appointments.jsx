import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Video } from "lucide-react"

const upcomingAppointments = [
  {
    id: 1,
    doctor: "Dr. Jane Smith",
    specialty: "General Physician",
    date: "Today",
    time: "3:30 PM",
    type: "Video Consultation",
    status: "Confirmed",
    icon: Video,
  },
  {
    id: 2,
    doctor: "Dr. Mark Johnson",
    specialty: "Dermatologist",
    date: "Tomorrow",
    time: "10:00 AM",
    type: "In-Person Visit",
    status: "Confirmed",
    icon: MapPin,
  },
]

export function UpcomingAppointments() {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
        <CardDescription>Your scheduled appointments</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <h4 className="font-semibold">{appointment.doctor}</h4>
                      <Badge variant={appointment.type.includes("Video") ? "default" : "outline"} className="ml-2">
                        <appointment.icon className="mr-1 h-3 w-3" />
                        {appointment.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                  >
                    {appointment.status}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4 text-primary" />
                    {appointment.date}
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-primary" />
                    {appointment.time}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {appointment.type.includes("Video") && (
                    <Button className="h-8 gap-1 px-3">
                      <Video className="h-3.5 w-3.5" />
                      Join Call
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="h-8 gap-1 px-3">
                    Reschedule
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No Upcoming Appointments</h3>
            <p className="mt-2 text-sm text-muted-foreground">Schedule your next appointment with your doctor.</p>
            <Button className="mt-4">Book Appointment</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

