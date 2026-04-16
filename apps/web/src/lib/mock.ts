import type { ArtworkCardData } from "@/components/ArtworkCard"

/**
 * Mock data for development — will be replaced by indexer queries.
 * Each section of the home page gets its own mock array.
 */

const PLACEHOLDER_IMG = "https://placehold.co/800x1000/F2F2F2/999999?text=NFT"

export const mockTrending: ArtworkCardData[] = [
  {
    contract: "0x3B3ee1931Dc30C1957379FAc9aba94D1C48a5405",
    tokenId: "1",
    title: "Genesis",
    creator: "0xArtist1",
    creatorHandle: "artist.eth",
    imageUrl: PLACEHOLDER_IMG,
    status: "sold",
    price: BigInt("2500000000000000000"),
  },
  {
    contract: "0x3B3ee1931Dc30C1957379FAc9aba94D1C48a5405",
    tokenId: "2",
    title: "Refraction III",
    creator: "0xArtist2",
    creatorHandle: "refik.eth",
    imageUrl: PLACEHOLDER_IMG,
    status: "live",
    price: BigInt("1200000000000000000"),
    endTime: Math.floor(Date.now() / 1000) + 3600 * 5,
  },
  {
    contract: "0x3B3ee1931Dc30C1957379FAc9aba94D1C48a5405",
    tokenId: "3",
    title: "Meadow #47",
    creator: "0xArtist3",
    creatorHandle: "nft_nyc",
    imageUrl: PLACEHOLDER_IMG,
    status: "available",
    price: BigInt("800000000000000000"),
  },
  {
    contract: "0x3B3ee1931Dc30C1957379FAc9aba94D1C48a5405",
    tokenId: "4",
    title: "Cascade",
    creator: "0xArtist4",
    creatorHandle: "cascade.eth",
    imageUrl: PLACEHOLDER_IMG,
    status: "upcoming",
  },
  {
    contract: "0x3B3ee1931Dc30C1957379FAc9aba94D1C48a5405",
    tokenId: "5",
    title: "Still Life No.12",
    creator: "0xArtist5",
    creatorHandle: "0x1234…abcd",
    imageUrl: PLACEHOLDER_IMG,
    status: "available",
    price: BigInt("350000000000000000"),
  },
  {
    contract: "0x3B3ee1931Dc30C1957379FAc9aba94D1C48a5405",
    tokenId: "6",
    title: "Void Receipt",
    creator: "0xArtist6",
    creatorHandle: "voidreceipt.eth",
    imageUrl: PLACEHOLDER_IMG,
    status: "sold",
    price: BigInt("5000000000000000000"),
  },
]

export const mockEndingSoon: ArtworkCardData[] = mockTrending
  .filter((a) => a.status === "live")
  .concat([
    {
      contract: "0x3B3ee1931Dc30C1957379FAc9aba94D1C48a5405",
      tokenId: "7",
      title: "Digital Bloom",
      creator: "0xArtist7",
      creatorHandle: "bloomist.eth",
      imageUrl: PLACEHOLDER_IMG,
      status: "live",
      price: BigInt("900000000000000000"),
      endTime: Math.floor(Date.now() / 1000) + 1800,
    },
  ])

export const mockNewListings: ArtworkCardData[] = mockTrending.filter(
  (a) => a.status === "available"
)
