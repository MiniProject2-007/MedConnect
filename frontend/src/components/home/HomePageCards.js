"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { User, MessageSquare, Calendar } from 'lucide-react'


export default function HomePageCards() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/doctors')
        if (!response.ok) {
          throw new Error('Failed to fetch doctors')
        }
        const data = await response.json()
        setDoctors(data)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {doctors.map((doctor) => (
        <Card key={doctor._id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-0">
            <div className="h-48 bg-gradient-to-br from-[#FF7F50] to-[#FF6347] flex items-center justify-center">
              <User className="w-24 h-24 text-white" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-1">{`${doctor.firstName} ${doctor.lastName}`}</h3>
              <p className="text-sm text-gray-600 mb-2">{doctor.specialization}</p>
              <p className="text-xs text-gray-500">{`${doctor.experience} years of experience`}</p>
              <p className="text-xs text-gray-500 mt-1">{doctor.qualifications}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between p-4 bg-gray-50">
            <Button variant="outline" size="sm" className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button size="sm" className="flex items-center bg-[#FF7F50] text-white hover:bg-[#FF6347]">
              <Calendar className="w-4 h-4 mr-2" />
              Appoint
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
