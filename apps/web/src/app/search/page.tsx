"use client"

import { useState } from "react"
import { ArtworkGrid } from "@/components/ArtworkGrid"

export default function SearchPage() {
  const [query, setQuery] = useState("")

  // TODO: hit Meilisearch via /api/search route handler

  return (
    <div className="mx-auto max-w-[2000px] px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Search</h1>

      {/* Search input */}
      <div className="mb-12 max-w-2xl">
        <input
          type="text"
          placeholder="Search artists, artworks, collections…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full rounded-full border border-gray-200 bg-gray-100 px-6 py-3 text-base outline-none transition-colors placeholder:text-gray-400 focus:border-black focus:bg-white"
        />
      </div>

      {/* Results */}
      {query ? (
        <ArtworkGrid artworks={[]} title={`Results for "${query}"`} />
      ) : (
        <p className="py-16 text-center text-gray-400">
          Start typing to search across artists, artworks, and collections.
        </p>
      )}
    </div>
  )
}
