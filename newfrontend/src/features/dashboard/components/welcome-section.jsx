import React from "react";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { useDashboard } from "./dashboard-provider"

export function WelcomeSection() {
  const { currentTime, currentUser } = useDashboard()

  // Determine greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  return (
    <Card className="overflow-hidden bg-white">
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {getGreeting()}, {currentUser.name} 👋
              </h2>
              <p className="text-muted-foreground">Ready for your next appointment?</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your doctor: <span className="font-medium text-foreground">Dr. Jane Smith</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Specialty: <span className="font-medium text-foreground">General Physician</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Next available: <span className="font-medium text-primary">Tomorrow, 10:00 AM</span>
              </p>
            </div>
            <Button className="gap-2">
              <Calendar className="h-4 w-4" />
              Book an Appointment
            </Button>
          </div>
          <div className="hidden items-center justify-center md:flex">
            <div className="rounded-xl bg-primary/10 p-8">
              <img src="/placeholder.svg?height=180&width=180" alt="Doctor" className="h-36 w-36 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

