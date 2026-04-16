import type { Metadata } from "next"
import { getRecentActivity } from "@/lib/queries"
import { formatEther } from "viem"

export const metadata: Metadata = {
  title: "Activity",
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000) - timestamp
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const sourceLabels: Record<string, string> = {
  auction: "Auction Sale",
  buyNow: "Buy Now",
  offer: "Offer Accepted",
  privateSale: "Private Sale",
}

export default async function ActivityPage() {
  let sales: any[] = []
  try {
    sales = await getRecentActivity()
  } catch {
    // Ponder not running
  }

  return (
    <div className="mx-auto max-w-[2000px] px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Activity</h1>

      {sales.length === 0 ? (
        <p className="py-16 text-center text-gray-400">
          No activity yet. Start the indexer to populate this feed.
        </p>
      ) : (
        <div className="divide-y divide-gray-200">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between py-4"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded bg-gray-100" />
                <div>
                  <p className="text-sm font-medium">
                    {sourceLabels[sale.source] ?? sale.source}
                  </p>
                  <p className="text-xs text-gray-400">
                    {truncateAddress(sale.seller)} → {truncateAddress(sale.buyer)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-medium">
                  {formatEther(BigInt(sale.amount))} ETH
                </p>
                <p className="text-xs text-gray-400">
                  {timeAgo(Number(sale.blockTime))}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
