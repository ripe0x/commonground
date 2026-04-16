import { ponderQuery } from "./ponder"
import type { ArtworkCardData } from "@/components/ArtworkCard"

// ─── Types matching Ponder schema ─────────────────────────────────────────────

type PonderToken = {
  id: string
  chainId: number
  contract: string
  tokenId: string
  creator: string | null
  owner: string | null
  tokenUri: string | null
  metadata: {
    name?: string
    description?: string
    image?: string
  } | null
  mediaUri: string | null
  createdAt: string | null
}

type PonderAuction = {
  id: string
  chainId: number
  contract: string
  tokenId: string
  seller: string
  reservePrice: string
  highestBid: string
  highestBidder: string | null
  endTime: string
  status: string
  txCreate: string | null
  txFinalize: string | null
}

type PonderListing = {
  id: string
  chainId: number
  contract: string
  tokenId: string
  kind: string
  seller: string
  price: string
  status: string
  createdAt: string
}

type PonderBid = {
  id: string
  auctionId: string
  bidder: string
  amount: string
  blockNumber: string
  logIndex: number
  txHash: string
  blockTime: string
}

type PonderSale = {
  id: string
  chainId: number
  contract: string
  tokenId: string
  seller: string
  buyer: string
  amount: string
  source: string
  txHash: string
  blockTime: string
}

type PonderTransfer = {
  id: string
  contract: string
  tokenId: string
  from: string
  to: string
  blockTime: string
  txHash: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function resolveImageUrl(token: PonderToken): string {
  // Prefer mediaUri (resolved IPFS), then metadata.image, then placeholder
  if (token.mediaUri) return ipfsToHttp(token.mediaUri)
  if (token.metadata?.image) return ipfsToHttp(token.metadata.image)
  return "https://placehold.co/800x1000/F2F2F2/999999?text=NFT"
}

function ipfsToHttp(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    let cid = uri.replace("ipfs://", "")
    // Fix Foundation's double-prefix bug: ipfs://ipfs/Qm...
    if (cid.startsWith("ipfs/")) cid = cid.replace("ipfs/", "")
    return `https://nftstorage.link/ipfs/${cid}`
  }
  return uri
}

function tokenToCard(
  token: PonderToken,
  listing?: PonderListing | null,
  auction?: PonderAuction | null
): ArtworkCardData {
  let status: ArtworkCardData["status"] = "sold"
  let price: bigint | undefined
  let endTime: number | undefined

  if (auction && auction.status === "active") {
    status = "live"
    price = BigInt(auction.highestBid || auction.reservePrice)
    endTime = Number(auction.endTime)
  } else if (listing && listing.status === "active") {
    status = "available"
    price = BigInt(listing.price)
  }

  return {
    contract: token.contract,
    tokenId: token.tokenId,
    title: token.metadata?.name ?? `#${token.tokenId}`,
    creator: token.creator ?? "",
    creatorHandle: token.creator ? truncateAddress(token.creator) : "",
    imageUrl: resolveImageUrl(token),
    status,
    price,
    endTime,
  }
}

// ─── Home page queries ────────────────────────────────────────────────────────

export async function getEndingSoon(): Promise<ArtworkCardData[]> {
  const now = Math.floor(Date.now() / 1000)

  const data = await ponderQuery<{ auctionss: { items: PonderAuction[] } }>(`
    query EndingSoon($now: BigInt!) {
      auctionss(
        where: { status: "active", endTime_gt: $now }
        orderBy: "endTime"
        orderDirection: "asc"
        limit: 8
      ) {
        items {
          id contract tokenId seller reservePrice
          highestBid highestBidder endTime status
        }
      }
    }
  `, { now: String(now) })

  // Deduplicate by contract+tokenId
  const seen = new Set<string>()
  const auctions = data.auctionss.items.filter(a => {
    const key = `${a.contract.toLowerCase()}:${a.tokenId}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  if (auctions.length === 0) return []

  // Fetch token data for these auctions
  const tokens = await fetchTokensByIds(auctions.map(a => ({
    chainId: a.chainId,
    contract: a.contract,
    tokenId: a.tokenId,
  })))

  return auctions.map(auction => {
    const token = tokens.find(
      t => t.contract.toLowerCase() === auction.contract.toLowerCase() && t.tokenId === auction.tokenId
    )
    if (token) return tokenToCard(token, null, auction)
    // No indexed token — show card from auction data alone
    return {
      contract: auction.contract,
      tokenId: auction.tokenId,
      title: `#${auction.tokenId}`,
      creator: auction.seller,
      creatorHandle: truncateAddress(auction.seller),
      imageUrl: "https://placehold.co/800x1000/F2F2F2/999999?text=NFT",
      status: "live" as const,
      price: BigInt(auction.highestBid || auction.reservePrice),
      endTime: Number(auction.endTime),
    }
  })
}

export async function getNewListings(): Promise<ArtworkCardData[]> {
  const data = await ponderQuery<{ listingss: { items: PonderListing[] } }>(`
    query NewListings {
      listingss(
        where: { status: "active" }
        orderBy: "createdAt"
        orderDirection: "desc"
        limit: 12
      ) {
        items {
          id chainId contract tokenId kind seller price status createdAt
        }
      }
    }
  `)

  // Deduplicate by contract+tokenId
  const seen = new Set<string>()
  const listings = data.listingss.items.filter(l => {
    const key = `${l.contract.toLowerCase()}:${l.tokenId}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  if (listings.length === 0) return []

  const tokens = await fetchTokensByIds(listings.map(l => ({
    chainId: l.chainId,
    contract: l.contract,
    tokenId: l.tokenId,
  })))

  return listings.map(listing => {
    const token = tokens.find(
      t => t.contract.toLowerCase() === listing.contract.toLowerCase() && t.tokenId === listing.tokenId
    )
    if (token) return tokenToCard(token, listing, null)
    // No indexed token — show card from listing data alone
    return {
      contract: listing.contract,
      tokenId: listing.tokenId,
      title: `#${listing.tokenId}`,
      creator: listing.seller,
      creatorHandle: truncateAddress(listing.seller),
      imageUrl: "https://placehold.co/800x1000/F2F2F2/999999?text=NFT",
      status: "available" as const,
      price: BigInt(listing.price),
    }
  })
}

export async function getRecentSales(): Promise<ArtworkCardData[]> {
  const data = await ponderQuery<{ saless: { items: PonderSale[] } }>(`
    query RecentSales {
      saless(
        orderBy: "blockTime"
        orderDirection: "desc"
        limit: 24
      ) {
        items {
          id chainId contract tokenId seller buyer amount source txHash blockTime
        }
      }
    }
  `)

  // Deduplicate by contract+tokenId (keep most recent sale per token)
  const seen = new Set<string>()
  const sales = data.saless.items.filter(s => {
    const key = `${s.contract.toLowerCase()}:${s.tokenId}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  if (sales.length === 0) return []

  const tokens = await fetchTokensByIds(sales.map(s => ({
    chainId: s.chainId,
    contract: s.contract,
    tokenId: s.tokenId,
  })))

  return sales.map(sale => {
    const token = tokens.find(
      t => t.contract.toLowerCase() === sale.contract.toLowerCase() && t.tokenId === sale.tokenId
    )
    if (token) {
      return {
        ...tokenToCard(token, null, null),
        status: "sold" as const,
        price: BigInt(sale.amount),
      }
    }
    // No indexed token — show card from sale data alone
    return {
      contract: sale.contract,
      tokenId: sale.tokenId,
      title: `#${sale.tokenId}`,
      creator: sale.seller,
      creatorHandle: truncateAddress(sale.seller),
      imageUrl: "https://placehold.co/800x1000/F2F2F2/999999?text=NFT",
      status: "sold" as const,
      price: BigInt(sale.amount),
    }
  })
}

// ─── Token page queries ───────────────────────────────────────────────────────

export async function getTokenPageData(contract: string, tokenId: string) {
  const data = await ponderQuery<{
    tokenss: { items: PonderToken[] }
    auctionss: { items: PonderAuction[] }
    listingss: { items: PonderListing[] }
    bidss: { items: PonderBid[] }
    transferss: { items: PonderTransfer[] }
  }>(`
    query TokenPage($contract: String!, $tokenId: BigInt!) {
      tokenss(where: { contract: $contract, tokenId: $tokenId }, limit: 1) {
        items {
          id chainId contract tokenId creator owner tokenUri metadata mediaUri createdAt
        }
      }
      auctionss(
        where: { contract: $contract, tokenId: $tokenId, status: "active" }
        limit: 1
      ) {
        items {
          id chainId contract tokenId seller reservePrice
          highestBid highestBidder endTime status txCreate txFinalize
        }
      }
      listingss(
        where: { contract: $contract, tokenId: $tokenId, status: "active" }
        limit: 1
      ) {
        items {
          id chainId contract tokenId kind seller price status createdAt
        }
      }
      bidss(
        where: { auctionId_in: [] }
        orderBy: "blockTime"
        orderDirection: "desc"
        limit: 50
      ) {
        items {
          id auctionId bidder amount blockNumber logIndex txHash blockTime
        }
      }
      transferss(
        where: { contract: $contract, tokenId: $tokenId }
        orderBy: "blockTime"
        orderDirection: "desc"
        limit: 20
      ) {
        items {
          id contract tokenId from to blockTime txHash
        }
      }
    }
  `, { contract, tokenId })

  const token = data.tokenss.items[0]
  if (!token) return null

  const auction = data.auctionss.items[0] ?? null
  const listing = data.listingss.items.find(l => l.kind === "buyNow") ?? null

  // If there's an active auction, fetch bids for it
  let bids: PonderBid[] = []
  if (auction) {
    const bidData = await ponderQuery<{ bidss: { items: PonderBid[] } }>(`
      query AuctionBids($auctionId: BigInt!) {
        bidss(
          where: { auctionId: $auctionId }
          orderBy: "blockTime"
          orderDirection: "desc"
          limit: 50
        ) {
          items {
            id auctionId bidder amount blockNumber logIndex txHash blockTime
          }
        }
      }
    `, { auctionId: auction.id })
    bids = bidData.bidss.items
  }

  return {
    token,
    auction,
    listing,
    bids,
    transfers: data.transferss.items,
    imageUrl: resolveImageUrl(token),
  }
}

// ─── Creator page queries ─────────────────────────────────────────────────────

export async function getCreatorTokens(creatorAddress: string): Promise<ArtworkCardData[]> {
  const data = await ponderQuery<{ tokenss: { items: PonderToken[] } }>(`
    query CreatorTokens($creator: String!) {
      tokenss(
        where: { creator: $creator }
        orderBy: "createdAt"
        orderDirection: "desc"
        limit: 50
      ) {
        items {
          id chainId contract tokenId creator owner tokenUri metadata mediaUri createdAt
        }
      }
    }
  `, { creator: creatorAddress })

  return data.tokenss.items.map(token => tokenToCard(token, null, null))
}

// ─── Portfolio queries ────────────────────────────────────────────────────────

export async function getOwnedTokens(ownerAddress: string): Promise<ArtworkCardData[]> {
  const data = await ponderQuery<{ tokenss: { items: PonderToken[] } }>(`
    query OwnedTokens($owner: String!) {
      tokenss(
        where: { owner: $owner }
        orderBy: "createdAt"
        orderDirection: "desc"
        limit: 50
      ) {
        items {
          id chainId contract tokenId creator owner tokenUri metadata mediaUri createdAt
        }
      }
    }
  `, { owner: ownerAddress })

  return data.tokenss.items.map(token => tokenToCard(token, null, null))
}

export async function getCreatedTokens(creatorAddress: string): Promise<ArtworkCardData[]> {
  return getCreatorTokens(creatorAddress)
}

export async function getActiveBids(bidderAddress: string) {
  const data = await ponderQuery<{ bidss: { items: PonderBid[] } }>(`
    query ActiveBids($bidder: String!) {
      bidss(
        where: { bidder: $bidder }
        orderBy: "blockTime"
        orderDirection: "desc"
        limit: 50
      ) {
        items {
          id auctionId bidder amount blockNumber logIndex txHash blockTime
        }
      }
    }
  `, { bidder: bidderAddress })

  return data.bidss.items
}

export async function getActiveOffers(buyerAddress: string) {
  const data = await ponderQuery<{
    offerss: {
      items: {
        id: string
        contract: string
        tokenId: string
        buyer: string
        amount: string
        expiresAt: string | null
        status: string
      }[]
    }
  }>(`
    query ActiveOffers($buyer: String!) {
      offerss(
        where: { buyer: $buyer, status: "active" }
        orderBy: "amount"
        orderDirection: "desc"
        limit: 50
      ) {
        items {
          id contract tokenId buyer amount expiresAt status
        }
      }
    }
  `, { buyer: buyerAddress })

  return data.offerss.items
}

// ─── Activity feed ────────────────────────────────────────────────────────────

export async function getRecentActivity() {
  const data = await ponderQuery<{ saless: { items: PonderSale[] } }>(`
    query RecentActivity {
      saless(
        orderBy: "blockTime"
        orderDirection: "desc"
        limit: 50
      ) {
        items {
          id chainId contract tokenId seller buyer amount source txHash blockTime
        }
      }
    }
  `)

  return data.saless.items
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function fetchTokensByIds(
  ids: { chainId: number; contract: string; tokenId: string }[]
): Promise<PonderToken[]> {
  if (ids.length === 0) return []

  // Build composite IDs matching the Ponder schema: "chainId:contract:tokenId"
  // Ponder stores addresses as lowercase hex
  const compositeIds = ids.map(
    ({ chainId, contract, tokenId }) => `${chainId}:${contract.toLowerCase()}:${tokenId}`
  )

  const data = await ponderQuery<{ tokenss: { items: PonderToken[] } }>(`
    query TokensByIds($ids: [String!]!) {
      tokenss(where: { id_in: $ids }, limit: ${ids.length}) {
        items {
          id chainId contract tokenId creator owner tokenUri metadata mediaUri createdAt
        }
      }
    }
  `, { ids: compositeIds })

  return data.tokenss.items
}
