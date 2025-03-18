import React from "react"
import { useRef, useState } from "react"
import { useInView } from "framer-motion"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

export function LandingTestimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Patient",
      image: "/placeholder.svg?height=80&width=80",
      content:
        "HealthConnect has transformed how I manage my healthcare. The video consultations save me so much time, and I love being able to message my doctor directly with quick questions.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Patient",
      image: "/placeholder.svg?height=80&width=80",
      content:
        "As someone with a chronic condition, having all my medical records and prescriptions in one place has been a game-changer. The appointment reminders ensure I never miss a follow-up.",
      rating: 5,
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Cardiologist",
      image: "/placeholder.svg?height=80&width=80",
      content:
        "From a physician's perspective, HealthConnect streamlines my practice and allows me to provide more personalized care. The secure messaging feature has improved patient communication significantly.",
      rating: 5,
    },
    {
      name: "James Wilson",
      role: "Patient",
      image: "/placeholder.svg?height=80&width=80",
      content:
        "I was skeptical about telemedicine at first, but HealthConnect changed my mind. The platform is intuitive, and the video quality is excellent. It's like being in the doctor's office without the wait.",
      rating: 4,
    },
    {
      name: "Dr. Robert Kim",
      role: "Family Physician",
      image: "/placeholder.svg?height=80&width=80",
      content:
        "HealthConnect has helped me expand my practice and reach patients who would otherwise struggle to make in-person appointments. The scheduling system is efficient and reduces administrative work.",
      rating: 5,
    },
  ]

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + 3)

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(testimonials.length - 3, prev + 1))
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section id="testimonials" className="py-20 bg-background" ref={ref}>
      <div className="px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            What Our <span className="text-primary">Users Say</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Don't just take our word for it. Here's what patients and healthcare providers have to say about
            HealthConnect.
          </p>
        </div>

        <div className="relative">
          <motion.div
            className="grid gap-6 md:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {visibleTestimonials.map((testimonial, index) => (
              <motion.div key={index} variants={itemVariants} whileHover={{ y: -10, transition: { duration: 0.2 } }}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                    <p className="mb-6 text-muted-foreground">"{testimonial.content}"</p>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={testimonial.image} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex justify-center mt-10 gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex >= testimonials.length - 3}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

