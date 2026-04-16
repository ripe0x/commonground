import { SITE_TITLE } from "@commonground/shared"
import { ArtworkGrid } from "@/components/ArtworkGrid"
import { getEndingSoon, getNewListings, getRecentSales } from "@/lib/queries"

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export default async function HomePage() {
  const [endingSoon, recentSales, newListings] = await Promise.all([
    safeQuery(getEndingSoon, []),
    safeQuery(getRecentSales, []),
    safeQuery(getNewListings, []),
  ])

  return (
    <div className="mx-auto max-w-[2000px] px-6 py-12 space-y-16">
      {/* Hero */}
      <section className="space-y-4">
        <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
          {SITE_TITLE}
        </h1>
        <p className="max-w-xl text-lg text-gray-600">
          A community-operated frontend for the Foundation smart contracts.
          Browse, bid, buy, and list — directly on-chain.
        </p>
      </section>

      {/* New Listings */}
      {newListings.length > 0 && (
        <ArtworkGrid artworks={newListings} title="New Listings" />
      )}

      {/* Ending Soon */}
      {endingSoon.length > 0 && (
        <ArtworkGrid artworks={endingSoon} title="Ending Soon" />
      )}

      {/* Recent Sales */}
      {recentSales.length > 0 && (
        <ArtworkGrid artworks={recentSales} title="Recent Sales" />
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 pt-8 pb-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-400">
            {SITE_TITLE} — interacting with Foundation contracts on Ethereum
            &amp; Base.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a
              href="https://etherscan.io/address/0xcDA72070E455bb31C7690a170224Ce43623d0B6f"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              NFTMarket ↗
            </a>
            <a
              href="https://github.com/f8n/fnd-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              Contracts ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
