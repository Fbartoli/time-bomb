"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"


interface CountdownTimerProps {
  endTime: number
}

export default function CountdownTimer({ endTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
    progress: 100,
  })

  useEffect(() => {

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const difference = new Date(endTime).getTime() - now

      // Calculate total duration (24 hours in milliseconds)
      const totalDuration = 24 * 60 * 60 * 1000
      const elapsed = totalDuration - difference
      const progressPercentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        return {
          days,
          hours,
          minutes,
          seconds,
          total: difference,
          progress: 100 - progressPercentage,
        }
      } else {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
          progress: 0,
        }
      }
    }

    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(() => {
      const updatedTimeLeft = calculateTimeLeft()
      setTimeLeft(updatedTimeLeft)

      if (updatedTimeLeft.total <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  // Format numbers to always have two digits
  const formatNumber = (num: number) => num.toString().padStart(2, "0")

  // Determine color based on time left
  const getColorClass = () => {
    if (timeLeft.progress < 25) return "text-[#FF4000]"
    if (timeLeft.progress < 50) return "text-[#FF7300]"
    return "text-[#FD9D00]"
  }

  return (
    <div className="bg-zinc-800/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-zinc-400 text-xs flex items-center gap-1">
          <Clock className="h-3 w-3" /> Deposit Window Closing In
        </p>
        <div className={`text-xs font-medium ${getColorClass()}`}>{timeLeft.total > 0 ? "OPEN" : "CLOSED"}</div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-zinc-900/80 rounded-lg p-2 text-center">
          <p className={`text-xl font-bold ${getColorClass()}`}>{formatNumber(timeLeft.days)}</p>
          <p className="text-[10px] text-zinc-500 uppercase">Days</p>
        </div>
        <div className="bg-zinc-900/80 rounded-lg p-2 text-center">
          <p className={`text-xl font-bold ${getColorClass()}`}>{formatNumber(timeLeft.hours)}</p>
          <p className="text-[10px] text-zinc-500 uppercase">Hours</p>
        </div>
        <div className="bg-zinc-900/80 rounded-lg p-2 text-center">
          <p className={`text-xl font-bold ${getColorClass()}`}>{formatNumber(timeLeft.minutes)}</p>
          <p className="text-[10px] text-zinc-500 uppercase">Mins</p>
        </div>
        <div className="bg-zinc-900/80 rounded-lg p-2 text-center">
          <p className={`text-xl font-bold ${getColorClass()}`}>{formatNumber(timeLeft.seconds)}</p>
          <p className="text-[10px] text-zinc-500 uppercase">Secs</p>
        </div>
      </div>
    </div>
  )
}

