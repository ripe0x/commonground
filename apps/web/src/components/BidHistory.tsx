import { formatEther } from "viem"

export type BidEntry = {
  bidder: string
  bidderHandle: string
  amount: bigint
  timestamp: number
  txHash: string
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000) - timestamp
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function BidHistory({ bids }: { bids: BidEntry[] }) {
  if (bids.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
        Bid History
      </h3>
      <ul className="divide-y divide-gray-200">
        {bids.map((bid, i) => (
          <li key={bid.txHash} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {/* Avatar placeholder */}
              <div className="h-8 w-8 rounded-full bg-gray-100" />
              <div>
                <p className="text-sm font-medium">{bid.bidderHandle}</p>
                <p className="text-xs text-gray-400">{timeAgo(bid.timestamp)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-medium">
                {formatEther(bid.amount)} ETH
              </p>
              <a
                href={`https://etherscan.io/tx/${bid.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-black transition-colors"
              >
                View tx ↗
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
