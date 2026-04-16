import type { Metadata } from "next"
import { SITE_TITLE } from "@commonground/shared"
import { ArtworkGrid } from "@/components/ArtworkGrid"
import { getCreatorTokens } from "@/lib/queries"

type Params = Promise<{ handle: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { handle } = await params
  return {
    title: handle,
    description: `Works by ${handle} on ${SITE_TITLE}`,
  }
}

export default async function CreatorPage({
  params,
}: {
  params: Params
}) {
  const { handle } = await params

  // If handle is an address, use it directly; otherwise show as-is
  const isAddress = handle.startsWith("0x") && handle.length === 42
  const address = isAddress ? handle : ""

  let works
  try {
    works = address ? await getCreatorTokens(address) : []
  } catch {
    works = []
  }

  return (
    <div className="mx-auto max-w-[2000px] px-6 py-12">
      {/* Profile header */}
      <div className="flex items-start gap-6 mb-12">
        <div className="h-20 w-20 shrink-0 rounded-full bg-gray-100" />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{handle}</h1>
          {address && (
            <p className="font-mono text-xs text-gray-400">
              {address.slice(0, 6)}…{address.slice(-4)}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-8">
        <button className="border-b-2 border-black pb-3 text-sm font-medium">
          Works
        </button>
        <button className="pb-3 text-sm text-gray-400 hover:text-black transition-colors">
          Collections
        </button>
      </div>

      <ArtworkGrid artworks={works} />
    </div>
  )
}
