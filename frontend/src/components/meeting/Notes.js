import React, { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

export default function Notes() {
  const [notes, setNotes] = useState("")
  const maxCharacters = 500

  const handleNotesChange = (event) => {
    const value = event.target.value
    if (value.length <= maxCharacters) {
      setNotes(value)
    }
  }

  const handleSave = () => {
    // Implement save functionality here
    console.log("Notes saved:", notes)
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#FF7F50]">Consultation Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Type your notes here..."
          value={notes}
          onChange={handleNotesChange} 
          className="min-h-[200px] resize-none border-[#FF7F50] focus:ring-[#FF7F50] focus:border-[#FF7F50]"
        />
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {notes.length}/{maxCharacters} characters
        </span>
        <Button
          onClick={handleSave}
          className="bg-[#FF7F50] hover:bg-[#FF6347] text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Notes
        </Button>
      </CardFooter>
    </Card>
  )
}