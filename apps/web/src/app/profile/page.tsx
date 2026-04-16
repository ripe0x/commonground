"use client"

import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { ArtworkGrid } from "@/components/ArtworkGrid"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import type { ArtworkCardData } from "@/components/ArtworkCard"

type Tab = "owned" | "created" | "bids" | "offers" | "activity"

const tabs: { key: Tab; label: string }[] = [
  { key: "owned", label: "Owned" },
  { key: "created", label: "Created" },
  { key: "bids", label: "Bids" },
  { key: "offers", label: "Offers" },
  { key: "activity", label: "Activity" },
]

async function fetchPortfolio(
  tab: Tab,
  address: string
): Promise<ArtworkCardData[]> {
  const ponderUrl = process.env.NEXT_PUBLIC_PONDER_URL ?? "http://localhost:42069"
  const field = tab === "owned" ? "owner" : "creator"

  const res = await fetch(`${ponderUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query Portfolio($address: String!) {
          tokenss(
            where: { ${field}: $address }
            orderBy: "createdAt"
            orderDirection: "desc"
            limit: 50
          ) {
            items {
              id chainId contract tokenId creator owner metadata mediaUri
            }
          }
        }
      `,
      variables: { address },
    }),
  })

  if (!res.ok) return []
  const json = await res.json()
  const tokens = json.data?.tokenss?.items ?? []

  return tokens.map((t: any) => ({
    contract: t.contract,
    tokenId: t.tokenId,
    title: t.metadata?.name ?? `#${t.tokenId}`,
    creator: t.creator ?? "",
    creatorHandle: t.creator
      ? `${t.creator.slice(0, 6)}…${t.creator.slice(-4)}`
      : "",
    imageUrl: t.mediaUri
      ? t.mediaUri.startsWith("ipfs://")
        ? `https://cloudflare-ipfs.com/ipfs/${t.mediaUri.replace("ipfs://", "")}`
        : t.mediaUri
      : t.metadata?.image
        ? t.metadata.image.startsWith("ipfs://")
          ? `https://cloudflare-ipfs.com/ipfs/${t.metadata.image.replace("ipfs://", "")}`
          : t.metadata.image
        : "https://placehold.co/800x1000/F2F2F2/999999?text=NFT",
    status: "sold" as const,
  }))
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<Tab>("owned")

  const { data: artworks = [] } = useQuery({
    queryKey: ["portfolio", activeTab, address],
    queryFn: () => fetchPortfolio(activeTab, address!),
    enabled: isConnected && !!address && (activeTab === "owned" || activeTab === "created"),
  })

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-[2000px] px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight mb-4">
          Your Portfolio
        </h1>
        <p className="text-gray-400 mb-8">
          Connect your wallet to view your Foundation NFTs.
        </p>
        <div className="inline-block">
          <ConnectButton />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[2000px] px-6 py-12">
      {/* Header */}
      <div className="flex items-start gap-6 mb-12">
        <div className="h-20 w-20 shrink-0 rounded-full bg-gray-100" />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {address?.slice(0, 6)}…{address?.slice(-4)}
          </h1>
          <p className="font-mono text-xs text-gray-400">{address}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-black font-medium"
                : "text-gray-400 hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "activity" ? (
        <p className="py-16 text-center text-gray-400">
          Activity feed will populate as the indexer runs.
        </p>
      ) : activeTab === "bids" || activeTab === "offers" ? (
        <p className="py-16 text-center text-gray-400">
          {activeTab === "bids" ? "Your active bids" : "Your active offers"}{" "}
          will appear here.
        </p>
      ) : (
        <ArtworkGrid artworks={artworks} />
      )}
    </div>
  )
}
