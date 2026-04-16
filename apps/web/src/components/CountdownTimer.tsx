"use client"

import { useState, useEffect } from "react"

export function CountdownTimer({ endTime }: { endTime: number }) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, endTime - Math.floor(Date.now() / 1000))
  )

  useEffect(() => {
    if (remaining <= 0) return
    const interval = setInterval(() => {
      setRemaining(Math.max(0, endTime - Math.floor(Date.now() / 1000)))
    }, 1000)
    return () => clearInterval(interval)
  }, [endTime, remaining])

  if (remaining <= 0) {
    return <span className="text-status-sold font-mono">Auction ended</span>
  }

  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60

  return (
    <span className="font-mono tabular-nums">
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </span>
  )
}
