import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Calendar, MessageSquare, FileText } from "lucide-react"

const notifications = [
  {
    id: 1,
    title: "Upcoming Appointment",
    description: "Video consultation with Dr. Jane Smith in 2 hours",
    time: "2 hours ago",
    icon: Calendar,
    variant: "primary",
  },
  {
    id: 2,
    title: "New Message",
    description: "Dr. Jane Smith sent you a message",
    time: "5 hours ago",
    icon: MessageSquare,
    variant: "default",
  },
  {
    id: 3,
    title: "Prescription Ready",
    description: "Your prescription for Allergy Medicine is ready",
    time: "Yesterday",
    icon: FileText,
    variant: "success",
  },
  {
    id: 4,
    title: "Health Tip",
    description: "Remember to stay hydrated throughout the day",
    time: "3 days ago",
    icon: Bell,
    variant: "default",
  },
]

export function NotificationsSection() {
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Your recent alerts</CardDescription>
        </div>
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start gap-3 rounded-lg border bg-card p-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full bg-${notification.variant === "primary" ? "primary" : notification.variant === "success" ? "green-500" : "secondary"}/10`}
              >
                <notification.icon
                  className={`h-4 w-4 text-${notification.variant === "primary" ? "primary" : notification.variant === "success" ? "green-500" : "secondary-foreground"}`}
                />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium">{notification.title}</h4>
                <p className="text-xs text-muted-foreground">{notification.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

