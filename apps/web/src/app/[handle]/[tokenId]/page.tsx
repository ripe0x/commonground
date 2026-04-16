import type { Metadata } from "next"
import { SITE_TITLE } from "@commonground/shared"
import { FOUNDATION_NFT, MAINNET_CHAIN_ID } from "@commonground/addresses"
import { BidPanel } from "@/components/BidPanel"
import { BidHistory, type BidEntry } from "@/components/BidHistory"
import { Provenance, type ProvenanceEntry } from "@/components/Provenance"
import { getTokenPageData } from "@/lib/queries"
import Link from "next/link"

type Params = Promise<{ handle: string; tokenId: string }>

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function ipfsToHttp(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    let cid = uri.replace("ipfs://", "")
    if (cid.startsWith("ipfs/")) cid = cid.replace("ipfs/", "")
    return `https://nftstorage.link/ipfs/${cid}`
  }
  return uri
}

async function resolveMetadataOnDemand(
  contract: string,
  tokenId: string,
): Promise<{ name?: string; description?: string; image?: string } | null> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    const res = await fetch(`${base}/api/meta/${contract}/${tokenId}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.metadata
  } catch {
    return null
  }
}

async function resolveTokenPage(handle: string, tokenId: string) {
  // If handle looks like an address, use it directly as the contract
  // Otherwise, assume it's for the shared FoundationNFT contract
  const isAddress = handle.startsWith("0x") && handle.length === 42
  const contract = isAddress
    ? handle
    : FOUNDATION_NFT[MAINNET_CHAIN_ID]

  try {
    const data = await getTokenPageData(contract, tokenId)
    if (!data) return null

    let { token, auction, listing, bids, transfers, imageUrl } = data

    // Resolve metadata on-demand if indexer hasn't populated it yet
    if (!token.metadata) {
      const meta = await resolveMetadataOnDemand(contract, tokenId)
      if (meta) {
        token = { ...token, metadata: meta }
        if (meta.image) {
          imageUrl = ipfsToHttp(meta.image)
        }
      }
    }

    return {
      title: token.metadata?.name ?? `#${tokenId}`,
      description: token.metadata?.description ?? "",
      creator: token.creator ?? "",
      creatorHandle: token.creator ? truncateAddress(token.creator) : handle,
      owner: token.owner ?? "",
      ownerHandle: token.owner ? truncateAddress(token.owner) : "",
      contract: token.contract,
      tokenId,
      imageUrl,
      chainId: token.chainId,
      auction: auction
        ? {
            auctionId: BigInt(auction.id),
            seller: auction.seller,
            reservePrice: BigInt(auction.reservePrice),
            highestBid: BigInt(auction.highestBid),
            highestBidder: auction.highestBidder ?? "",
            endTime: Number(auction.endTime),
            status: auction.status as "live" | "settled" | "available",
          }
        : undefined,
      buyNow: listing
        ? { seller: listing.seller, price: BigInt(listing.price) }
        : undefined,
      bids: bids.map(
        (b): BidEntry => ({
          bidder: b.bidder,
          bidderHandle: truncateAddress(b.bidder),
          amount: BigInt(b.amount),
          timestamp: Number(b.blockTime),
          txHash: b.txHash,
        })
      ),
      provenance: transfers.map(
        (t): ProvenanceEntry => ({
          event:
            t.from === "0x0000000000000000000000000000000000000000"
              ? "Minted"
              : "Transferred",
          from: t.from,
          fromHandle: truncateAddress(t.from),
          to: t.to,
          toHandle: truncateAddress(t.to),
          timestamp: Number(t.blockTime),
          txHash: t.txHash,
        })
      ),
    }
  } catch {
    return null
  }
}

// Fallback: resolve metadata directly from the chain when Ponder has no data
async function getChainFallback(handle: string, tokenId: string) {
  const isAddress = handle.startsWith("0x") && handle.length === 42
  const contract = isAddress ? handle : FOUNDATION_NFT[MAINNET_CHAIN_ID]

  const meta = await resolveMetadataOnDemand(contract, tokenId)
  const imageUrl = meta?.image ? ipfsToHttp(meta.image) : "https://placehold.co/1200x1500/F2F2F2/999999?text=Artwork"

  return {
    title: meta?.name ?? `#${tokenId}`,
    description: meta?.description ?? "",
    creator: "",
    creatorHandle: isAddress ? truncateAddress(handle) : handle,
    owner: "",
    ownerHandle: "",
    contract,
    tokenId,
    imageUrl,
    chainId: 1,
    auction: undefined,
    buyNow: undefined,
    bids: [] as BidEntry[],
    provenance: [] as ProvenanceEntry[],
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { handle, tokenId } = await params
  const data = (await resolveTokenPage(handle, tokenId)) ?? (await getChainFallback(handle, tokenId))
  return {
    title: `${data.title} by ${data.creatorHandle}`,
    description: data.description,
    openGraph: {
      title: `${data.title} by ${data.creatorHandle} | ${SITE_TITLE}`,
      description: data.description,
      images: [data.imageUrl],
    },
  }
}

export default async function TokenPage({
  params,
}: {
  params: Params
}) {
  const { handle, tokenId } = await params
  const data = (await resolveTokenPage(handle, tokenId)) ?? (await getChainFallback(handle, tokenId))

  return (
    <div className="mx-auto max-w-[2000px]">
      {/* Desktop: left/right split. Mobile: stacked. */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        {/* Left: artwork */}
        <div className="flex items-center justify-center bg-gray-100 lg:w-[60%] p-8 lg:p-16">
          <TokenMedia url={data.imageUrl} title={data.title} />
        </div>

        {/* Right: info panel */}
        <div className="lg:w-[40%] overflow-y-auto">
          <div className="p-6 lg:p-12 space-y-8">
            {/* Creator */}
            <div className="space-y-1">
              <Link
                href={`/${data.creatorHandle}`}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                {data.creatorHandle}
              </Link>
              <h1 className="text-3xl font-semibold tracking-tight">
                {data.title}
              </h1>
            </div>

            {/* Description */}
            {data.description && (
              <p className="text-base text-gray-600 leading-relaxed">
                {data.description}
              </p>
            )}

            {/* Ownership */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Owned by</span>
              <Link
                href={`/${data.ownerHandle}`}
                className="font-medium hover:underline"
              >
                {data.ownerHandle}
              </Link>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Bid / Buy panel */}
            <BidPanel
              data={{
                contract: data.contract,
                tokenId: data.tokenId,
                auction: data.auction,
                buyNow: data.buyNow,
                chainId: data.chainId,
              }}
            />

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Bid history */}
            <BidHistory bids={data.bids} />

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Provenance */}
            <Provenance entries={data.provenance} />

            {/* Contract info */}
            <div className="border-t border-gray-200 pt-6 space-y-2">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Contract
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-400">Contract</span>
                <a
                  href={`https://etherscan.io/address/${data.contract}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs truncate hover:underline"
                >
                  {data.contract}
                </a>
                <span className="text-gray-400">Token ID</span>
                <span className="font-mono text-xs">{data.tokenId}</span>
                <span className="text-gray-400">Chain</span>
                <span className="text-xs">
                  {data.chainId === 1 ? "Ethereum" : "Base"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".ogv"]

function TokenMedia({ url, title }: { url: string; title: string }) {
  const path = url.split("?")[0].toLowerCase()
  const isVideo = VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext))

  if (isVideo) {
    return (
      <video
        src={url}
        className="max-h-[80vh] w-auto object-contain"
        autoPlay
        loop
        muted
        playsInline
        controls
      />
    )
  }

  return (
    <img
      src={url}
      alt={title}
      className="max-h-[80vh] w-auto object-contain"
    />
  )
}
