import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Video, Upload, FileText } from "lucide-react"

const quickActions = [
  {
    title: "Book Appointment",
    description: "Schedule a new appointment",
    icon: Calendar,
    href: "/book-appointment",
  },
  {
    title: "Join Video Call",
    description: "Connect with your doctor",
    icon: Video,
    href: "/chat",
  },
  {
    title: "Upload Reports",
    description: "Share your medical records",
    icon: Upload,
    href: "/settings",
  },
  {
    title: "View Prescriptions",
    description: "Access your prescriptions",
    icon: FileText,
    href: "/consultations",
  },
]

export function QuickActions() {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Frequently used features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {quickActions.map((action) => (
            <Button key={action.title} variant="outline" className="h-auto justify-start p-3 text-left" asChild>
              <a href={action.href}>
                <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <action.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

