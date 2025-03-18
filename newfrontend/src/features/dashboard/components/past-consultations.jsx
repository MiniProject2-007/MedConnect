import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, FileCheck, Video, MapPin } from "lucide-react"

const pastConsultations = [
  {
    id: 1,
    doctor: "Dr. Jane Smith",
    specialty: "General Physician",
    date: "October 15, 2024",
    type: "Video Consultation",
    summary: "General health assessment, all vitals normal.",
    prescriptions: true,
    reports: true,
    icon: Video,
  },
  {
    id: 2,
    doctor: "Dr. Mark Johnson",
    specialty: "Dermatologist",
    date: "September 8, 2024",
    type: "In-Person Visit",
    summary: "Diagnosed with seasonal allergy. Prescribed antihistamines.",
    prescriptions: true,
    reports: false,
    icon: MapPin,
  },
]

export function PastConsultations() {
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Past Consultations</CardTitle>
          <CardDescription>Your previous appointments</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/consultations">View All</a>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pastConsultations.map((consultation) => (
            <div key={consultation.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <h4 className="font-semibold">{consultation.doctor}</h4>
                    <Badge variant={consultation.type.includes("Video") ? "default" : "outline"} className="ml-2">
                      <consultation.icon className="mr-1 h-3 w-3" />
                      {consultation.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{consultation.specialty}</p>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4 text-primary" />
                  <span className="text-sm">{consultation.date}</span>
                </div>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">{consultation.summary}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1 px-3">
                  <FileCheck className="h-3.5 w-3.5" />
                  View Summary
                </Button>
                {consultation.prescriptions && (
                  <Button variant="outline" size="sm" className="h-8 gap-1 px-3">
                    <Download className="h-3.5 w-3.5" />
                    Download Prescription
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

