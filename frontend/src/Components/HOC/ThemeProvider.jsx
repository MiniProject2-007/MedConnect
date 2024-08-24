'use client'
import { useAppSelector } from "@/lib/redux/hooks"
import React from "react"

export default function ThemeProvider({ children }) {
  const theme = useAppSelector((state) => state.theme)
  return <div id="mainCont" className={`${theme.theme}`}>{children}</div>
}

