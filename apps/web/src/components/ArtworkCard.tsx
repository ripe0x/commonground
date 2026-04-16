"use client"

import Link from "next/link"
import { formatEther } from "viem"
import { useState, useEffect } from "react"

export type ArtworkCardData = {
  contract: string
  tokenId: string
  title: string
  creator: string
  creatorHandle: string // ENS, Farcaster handle, or truncated address
  imageUrl: string
  status: "available" | "live" | "sold" | "upcoming"
  price?: bigint // wei
  endTime?: number // unix seconds, for live auctions
}

const PLACEHOLDER_URL = "https://placehold.co/800x1000/F2F2F2/999999?text=NFT"

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".ogv"]

function isVideoUrl(url: string): boolean {
  const path = url.split("?")[0].toLowerCase()
  return VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext))
}

const statusColors = {
  available: "bg-status-available",
  live: "bg-status-live",
  sold: "bg-status-sold",
  upcoming: "bg-status-upcoming",
} as const

const statusLabels = {
  available: "Buy Now",
  live: "Live Auction",
  sold: "Sold",
  upcoming: "Upcoming",
} as const

export function ArtworkCard({ artwork }: { artwork: ArtworkCardData }) {
  const href = `/${artwork.contract}/${artwork.tokenId}`

  const [imageUrl, setImageUrl] = useState(artwork.imageUrl)
  const [title, setTitle] = useState(artwork.title)

  // Resolve metadata on-demand for cards without images
  useEffect(() => {
    if (artwork.imageUrl !== PLACEHOLDER_URL) return

    fetch(`/api/meta/${artwork.contract}/${artwork.tokenId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return
        if (data.mediaUri) setImageUrl(data.mediaUri)
        if (data.metadata?.name) setTitle(data.metadata.name)
      })
      .catch(() => {})
  }, [artwork.contract, artwork.tokenId, artwork.imageUrl])

  const isVideo = isVideoUrl(imageUrl)

  return (
    <Link
      href={href}
      className="group block border border-gray-200 transition-colors hover:border-gray-400"
    >
      {/* Media — full bleed, no radius */}
      <div className="relative overflow-hidden bg-gray-100">
        {isVideo ? (
          <video
            src={imageUrl}
            className="w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={imageUrl}
            alt={title}
            className="w-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <p className="text-base font-medium leading-tight truncate">{title}</p>
        <p className="text-sm text-gray-600 truncate">
          {artwork.creatorHandle}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-full ${statusColors[artwork.status]}`}
            />
            <span className="text-xs text-gray-400">
              {statusLabels[artwork.status]}
            </span>
          </div>
          {artwork.price ? (
            <span className="font-mono text-sm font-medium">
              {parseFloat(formatEther(artwork.price)).toFixed(
                artwork.price < BigInt(1e16) ? 4 : 2,
              )}{" "}
              ETH
            </span>
          ) : null}
        </div>
        {artwork.status === "live" && artwork.endTime && (
          <CountdownTimer endTime={artwork.endTime} />
        )}
      </div>
    </Link>
  )
}

function CountdownTimer({ endTime }: { endTime: number }) {
  const now = Math.floor(Date.now() / 1000)
  const remaining = Math.max(0, endTime - now)
  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60

  if (remaining <= 0) {
    return (
      <p className="font-mono text-xs text-status-sold">Auction ended</p>
    )
  }

  return (
    <p className="font-mono text-xs text-gray-600">
      {hours}h {minutes}m {seconds}s remaining
    </p>
  )
}
