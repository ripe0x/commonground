"use client"

import { useState } from "react"
import { parseEther } from "viem"
import {
  useAccount,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi"
import { nftMarketAbi } from "@commonground/abi"
import { erc721Abi } from "@commonground/abi"
import { NFT_MARKET, MAINNET_CHAIN_ID } from "@commonground/addresses"
import { useParams } from "next/navigation"

type ListingType = "auction" | "buyNow"

export default function ListPage() {
  const params = useParams<{ contract: string; tokenId: string }>()
  const contract = params.contract as `0x${string}`
  const tokenId = BigInt(params.tokenId)
  const chainId = MAINNET_CHAIN_ID
  const marketAddress = NFT_MARKET[chainId]

  const { address, isConnected } = useAccount()
  const [listingType, setListingType] = useState<ListingType>("auction")
  const [price, setPrice] = useState("")

  // Step 1: check if approved
  const { data: isApproved } = useReadContract({
    address: contract,
    abi: erc721Abi,
    functionName: "isApprovedForAll",
    args: address ? [address, marketAddress] : undefined,
    query: { enabled: isConnected },
  })

  // Approve
  const { data: simApprove } = useSimulateContract({
    address: contract,
    abi: erc721Abi,
    functionName: "setApprovalForAll",
    args: [marketAddress, true],
    query: { enabled: isConnected && isApproved === false },
  })

  const {
    writeContract: writeApprove,
    data: approveTxHash,
    isPending: isApprovePending,
  } = useWriteContract()

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({ hash: approveTxHash })

  // Step 2: create listing
  const parsedPrice = price ? parseEther(price) : 0n

  const { data: simAuction } = useSimulateContract({
    address: marketAddress,
    abi: nftMarketAbi,
    functionName: "createReserveAuction",
    args: [contract, tokenId, parsedPrice],
    query: {
      enabled:
        isConnected &&
        listingType === "auction" &&
        (isApproved || isApproveConfirmed) &&
        parsedPrice > 0n,
    },
  })

  const { data: simBuyNow } = useSimulateContract({
    address: marketAddress,
    abi: nftMarketAbi,
    functionName: "setBuyPrice",
    args: [contract, tokenId, parsedPrice],
    query: {
      enabled:
        isConnected &&
        listingType === "buyNow" &&
        (isApproved || isApproveConfirmed) &&
        parsedPrice > 0n,
    },
  })

  const {
    writeContract: writeListing,
    data: listTxHash,
    isPending: isListPending,
  } = useWriteContract()

  const { isLoading: isListConfirming, isSuccess: isListConfirmed } =
    useWaitForTransactionReceipt({ hash: listTxHash })

  const approved = isApproved || isApproveConfirmed

  function handleApprove() {
    if (!simApprove?.request) return
    writeApprove(simApprove.request)
  }

  function handleList() {
    if (listingType === "auction") {
      if (!simAuction?.request) return
      writeListing(simAuction.request)
    } else {
      if (!simBuyNow?.request) return
      writeListing(simBuyNow.request)
    }
  }

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="text-gray-400">Connect your wallet to list this NFT.</p>
      </div>
    )
  }

  if (isListConfirmed) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center space-y-4">
        <div className="text-4xl">&#10003;</div>
        <h1 className="text-2xl font-semibold">Listed!</h1>
        <p className="text-gray-400">
          Your NFT has been listed on the Foundation marketplace.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-12 space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">List NFT</h1>

      <div className="text-sm text-gray-400 font-mono">
        {contract.slice(0, 10)}… / #{params.tokenId}
      </div>

      {/* Listing type tabs */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setListingType("auction")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            listingType === "auction"
              ? "bg-black text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Reserve Auction
        </button>
        <button
          onClick={() => setListingType("buyNow")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            listingType === "buyNow"
              ? "bg-black text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Buy Now
        </button>
      </div>

      {/* Price input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {listingType === "auction" ? "Reserve Price" : "Price"}
        </label>
        <div className="flex items-center rounded-lg border border-gray-200 focus-within:border-black transition-colors">
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="flex-1 bg-transparent px-4 py-3 font-mono text-base outline-none placeholder:text-gray-400"
          />
          <span className="pr-4 text-sm text-gray-400">ETH</span>
        </div>
      </div>

      {/* Two-step flow */}
      <div className="space-y-3">
        {/* Step 1: Approve */}
        {!approved && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-xs">
                1
              </span>
              Approve the marketplace contract
            </div>
            <button
              onClick={handleApprove}
              disabled={!simApprove?.request || isApprovePending || isApproveConfirming}
              className="w-full rounded-lg border border-black py-3 text-base font-medium transition-colors hover:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400"
            >
              {isApprovePending || isApproveConfirming
                ? "Approving…"
                : "Approve"}
            </button>
          </div>
        )}

        {/* Step 2: List */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-xs">
              {approved ? "1" : "2"}
            </span>
            {listingType === "auction"
              ? "Create reserve auction"
              : "Set buy now price"}
          </div>
          <button
            onClick={handleList}
            disabled={
              !approved ||
              parsedPrice === 0n ||
              isListPending ||
              isListConfirming
            }
            className="w-full rounded-lg bg-black py-3 text-base font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400"
          >
            {isListPending || isListConfirming
              ? "Listing…"
              : listingType === "auction"
                ? "Create Auction"
                : "List for Sale"}
          </button>
        </div>
      </div>

      {listingType === "auction" && (
        <p className="text-xs text-gray-400">
          Reserve auctions run for 24 hours after the first bid. A bid within
          the last 15 minutes extends the auction by 15 minutes. Anyone can
          settle the auction after it ends.
        </p>
      )}
    </div>
  )
}
