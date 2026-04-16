type Status = "available" | "live" | "sold" | "upcoming" | "settled"

const config: Record<Status, { dot: string; label: string }> = {
  available: { dot: "bg-status-available", label: "Buy Now" },
  live: { dot: "bg-status-live", label: "Live Auction" },
  sold: { dot: "bg-status-sold", label: "Sold" },
  upcoming: { dot: "bg-status-upcoming", label: "Upcoming" },
  settled: { dot: "bg-gray-400", label: "Settled" },
}

export function StatusBadge({ status }: { status: Status }) {
  const { dot, label } = config[status]

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}
