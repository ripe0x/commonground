import { onchainTable, index } from "@ponder/core"

export const collections = onchainTable("collections", (t) => ({
  id: t.text().primaryKey(), // chainId:address
  chainId: t.integer().notNull(),
  address: t.hex().notNull(),
  kind: t.text().notNull(), // "1of1" | "collection" | "drop" | "edition"
  creator: t.hex(),
  name: t.text(),
  symbol: t.text(),
  deployBlock: t.bigint(),
}))

export const tokens = onchainTable(
  "tokens",
  (t) => ({
    id: t.text().primaryKey(), // chainId:contract:tokenId
    chainId: t.integer().notNull(),
    contract: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    creator: t.hex(),
    owner: t.hex(),
    tokenUri: t.text(),
    metadata: t.json(),
    mediaUri: t.text(),
    createdAt: t.bigint(),
  }),
  (table) => ({
    contractTokenIdx: index().on(table.contract, table.tokenId),
    ownerIdx: index().on(table.owner),
    creatorIdx: index().on(table.creator),
  })
)

export const listings = onchainTable(
  "listings",
  (t) => ({
    id: t.text().primaryKey(),
    chainId: t.integer().notNull(),
    contract: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    kind: t.text().notNull(), // "buyNow" | "reserveAuction"
    seller: t.hex().notNull(),
    price: t.bigint().notNull(),
    status: t.text().notNull(), // "active" | "canceled" | "sold" | "invalidated"
    createdAt: t.bigint().notNull(),
    updatedAt: t.bigint(),
  }),
  (table) => ({
    contractTokenIdx: index().on(table.contract, table.tokenId),
    sellerIdx: index().on(table.seller),
    statusIdx: index().on(table.status),
  })
)

export const auctions = onchainTable(
  "auctions",
  (t) => ({
    id: t.bigint().primaryKey(), // auctionId from chain
    chainId: t.integer().notNull(),
    contract: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    seller: t.hex().notNull(),
    reservePrice: t.bigint().notNull(),
    highestBid: t.bigint().notNull().default(0n),
    highestBidder: t.hex(),
    endTime: t.bigint().notNull().default(0n),
    status: t.text().notNull(), // "active" | "finalized" | "canceled" | "invalidated"
    txCreate: t.hex(),
    txFinalize: t.hex(),
  }),
  (table) => ({
    contractTokenIdx: index().on(table.contract, table.tokenId),
    statusIdx: index().on(table.status),
  })
)

export const bids = onchainTable(
  "bids",
  (t) => ({
    id: t.text().primaryKey(), // txHash:logIndex
    auctionId: t.bigint().notNull(),
    bidder: t.hex().notNull(),
    amount: t.bigint().notNull(),
    blockNumber: t.bigint().notNull(),
    logIndex: t.integer().notNull(),
    txHash: t.hex().notNull(),
    blockTime: t.bigint().notNull(),
  }),
  (table) => ({
    auctionIdx: index().on(table.auctionId),
    bidderIdx: index().on(table.bidder),
  })
)

export const offers = onchainTable(
  "offers",
  (t) => ({
    id: t.text().primaryKey(), // chainId:contract:tokenId:buyer
    chainId: t.integer().notNull(),
    contract: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    buyer: t.hex().notNull(),
    amount: t.bigint().notNull(),
    expiresAt: t.bigint(),
    status: t.text().notNull(), // "active" | "accepted" | "canceled" | "invalidated"
  }),
  (table) => ({
    contractTokenIdx: index().on(table.contract, table.tokenId),
    buyerIdx: index().on(table.buyer),
  })
)

export const sales = onchainTable(
  "sales",
  (t) => ({
    id: t.text().primaryKey(), // txHash:logIndex
    chainId: t.integer().notNull(),
    contract: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    seller: t.hex().notNull(),
    buyer: t.hex().notNull(),
    amount: t.bigint().notNull(),
    source: t.text().notNull(), // "auction" | "buyNow" | "offer" | "privateSale"
    txHash: t.hex().notNull(),
    blockTime: t.bigint().notNull(),
  }),
  (table) => ({
    contractTokenIdx: index().on(table.contract, table.tokenId),
    blockTimeIdx: index().on(table.blockTime),
    sellerIdx: index().on(table.seller),
    buyerIdx: index().on(table.buyer),
  })
)

export const transfers = onchainTable(
  "transfers",
  (t) => ({
    id: t.text().primaryKey(), // txHash:logIndex
    chainId: t.integer().notNull(),
    contract: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    from: t.hex().notNull(),
    to: t.hex().notNull(),
    blockTime: t.bigint().notNull(),
    txHash: t.hex().notNull(),
    logIndex: t.integer().notNull(),
  }),
  (table) => ({
    contractTokenIdx: index().on(table.contract, table.tokenId),
    blockTimeIdx: index().on(table.blockTime),
  })
)

export const creators = onchainTable("creators", (t) => ({
  id: t.text().primaryKey(), // chainId:address
  chainId: t.integer().notNull(),
  address: t.hex().notNull(),
  primaryName: t.text(),
  ensName: t.text(),
  fcUsername: t.text(),
  profileLastResolvedAt: t.bigint(),
}))

export const processedTxs = onchainTable("processed_txs", (t) => ({
  txHash: t.hex().primaryKey(),
  blockNumber: t.bigint().notNull(),
}))
