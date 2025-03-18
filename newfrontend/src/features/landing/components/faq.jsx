import React from "react"
import { useRef } from "react"
import { useInView } from "framer-motion"
import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function LandingFAQ() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const faqs = [
    {
      question: "How do I book an appointment?",
      answer:
        "Booking an appointment is simple. After creating an account, navigate to the 'Book Appointment' section, select your preferred doctor, choose an available time slot, and confirm your booking. You'll receive a confirmation email and reminder notifications.",
    },
    {
      question: "Can I use HealthConnect for emergencies?",
      answer:
        "HealthConnect is not designed for emergency situations. If you're experiencing a medical emergency, please call emergency services (911) or go to your nearest emergency room immediately. Our platform is best suited for scheduled consultations and non-urgent care.",
    },
    {
      question: "How secure is my medical information?",
      answer:
        "We take your privacy seriously. HealthConnect uses end-to-end encryption for all communications and is fully HIPAA compliant. Your medical records and personal information are stored securely and only accessible to you and your authorized healthcare providers.",
    },
    {
      question: "What types of doctors are available on the platform?",
      answer:
        "HealthConnect offers access to a wide range of healthcare professionals, including general practitioners, specialists, mental health professionals, and more. You can filter doctors by specialty, availability, language, and other criteria to find the right provider for your needs.",
    },
    {
      question: "How do video consultations work?",
      answer:
        "Video consultations take place directly through our secure platform. At your scheduled appointment time, you'll receive a notification to join the call. You don't need to download any additional software—just ensure you have a stable internet connection and a device with a camera and microphone.",
    },
    {
      question: "Can I get prescriptions through HealthConnect?",
      answer:
        "Yes, doctors on HealthConnect can issue digital prescriptions when medically appropriate. These prescriptions can be sent directly to your preferred pharmacy for pickup, or in some cases, delivered to your home through our prescription delivery partners.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit and debit cards, PayPal, and in some regions, direct insurance billing. You can manage your payment methods in your account settings. For subscription plans, you'll be billed automatically according to your chosen billing cycle.",
    },
    {
      question: "How do I cancel or reschedule an appointment?",
      answer:
        "You can cancel or reschedule appointments through your dashboard. Navigate to 'My Appointments,' select the appointment you wish to modify, and choose 'Reschedule' or 'Cancel.' Please note that cancellations made less than 24 hours before the appointment may incur a fee, depending on the doctor's policy.",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <section id="faq" className="py-20 bg-background" ref={ref}>
      <div className="px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about HealthConnect and our services.
          </p>
        </div>

        <motion.div
          className="max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <p className="text-muted-foreground">
            Still have questions?{" "}
            <a href="#contact" className="text-primary font-medium hover:underline">
              Contact our support team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

