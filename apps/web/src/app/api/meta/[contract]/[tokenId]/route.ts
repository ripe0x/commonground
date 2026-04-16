import { NextRequest, NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"
import { erc721Abi } from "@commonground/abi"

const client = createPublicClient({
  chain: mainnet,
  transport: http(process.env.NEXT_PUBLIC_ALCHEMY_MAINNET_URL),
})

function ipfsToHttp(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    let cid = uri.replace("ipfs://", "")
    // Fix Foundation's double-prefix bug: ipfs://ipfs/Qm...
    if (cid.startsWith("ipfs/")) cid = cid.replace("ipfs/", "")
    return `https://nftstorage.link/ipfs/${cid}`
  }
  return uri
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ contract: string; tokenId: string }> },
) {
  const { contract, tokenId } = await params

  try {
    const tokenUri = await client.readContract({
      address: contract as `0x${string}`,
      abi: erc721Abi,
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
    })

    if (!tokenUri) {
      return NextResponse.json({ tokenUri: null, metadata: null, mediaUri: null })
    }

    const httpUrl = ipfsToHttp(tokenUri as string)
    const res = await fetch(httpUrl, { signal: AbortSignal.timeout(10_000) })

    if (!res.ok) {
      return NextResponse.json(
        { tokenUri, metadata: null, mediaUri: null },
        { headers: { "Cache-Control": "public, max-age=60" } },
      )
    }

    const metadata = await res.json()
    const mediaUri = metadata.image ? ipfsToHttp(metadata.image) : null

    return NextResponse.json(
      { tokenUri, metadata, mediaUri },
      { headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
    )
  } catch {
    return NextResponse.json(
      { tokenUri: null, metadata: null, mediaUri: null },
      { status: 404 },
    )
  }
}
