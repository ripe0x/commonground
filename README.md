# CommonGround

An independent, open-source frontend for the [Foundation](https://foundation.app) NFT marketplace smart contracts on Ethereum and Base.

Foundation's contracts are immutable and remain fully functional on-chain. CommonGround provides a community-operated interface to browse artwork, place bids, buy, make offers, list, and settle auctions — interacting directly with the same NFTMarket contracts.

## Architecture

```
apps/
  web/         Next.js 15 frontend (React 19, Tailwind v4, wagmi v2, RainbowKit)
  indexer/     Ponder indexer (on-chain event processing, GraphQL API)
packages/
  abi/         Hand-written ABI exports (as const, for viem type inference)
  addresses/   Contract addresses per chain
  shared/      Site config, shared types
```

**Indexer** — [Ponder](https://ponder.sh) processes on-chain events from the NFTMarket proxy and FoundationNFT contracts, storing token metadata, auctions, listings, bids, offers, sales, and transfers. Exposes a GraphQL API consumed by the frontend.

**Frontend** — Next.js app router with server components for data fetching and client components for wallet interactions. On-demand IPFS metadata resolution for tokens not yet indexed.

## Prerequisites

- Node.js 18+
- npm 9+
- An [Alchemy](https://alchemy.com) API key (free tier works)
- A [WalletConnect](https://cloud.walletconnect.com) project ID (free)

## Setup

```bash
# Clone and install
git clone <repo-url> && cd commonground
npm install

# Configure environment
cp apps/indexer/.env.example apps/indexer/.env.local
cp apps/web/.env.example apps/web/.env.local
# Edit both .env.local files with your API keys
```

## Development

You need two terminals — one for the indexer, one for the frontend:

```bash
# Terminal 1: Start the Ponder indexer
npm run dev:indexer
# Syncs on-chain data from Ethereum mainnet. First run takes ~15 min to backfill.
# GraphQL playground available at http://localhost:42069/graphql

# Terminal 2: Start the Next.js dev server
npm run dev
# Frontend available at http://localhost:3000
```

The indexer uses embedded PGlite by default — no Postgres install needed for development. Set `DATABASE_URL` in the indexer's `.env.local` for production use with Postgres.

## Contracts

CommonGround reads from and writes to Foundation's deployed contracts:

| Contract | Mainnet Address |
|----------|----------------|
| NFTMarket (proxy) | `0xcDA72070E455bb31C7690a170224Ce43623d0B6f` |
| FoundationNFT | `0x3B3ee1931Dc30C1957379FAc9aba94D1C48a5405` |

Source: [f8n/fnd-protocol](https://github.com/f8n/fnd-protocol)

## Features

- Browse NFTs with on-chain metadata resolution via IPFS
- View live auctions with countdown timers
- Place bids on reserve auctions
- Buy Now listings
- Token detail pages with bid history and provenance
- Video NFT support (mp4, mov, webm)
- Wallet connection via RainbowKit (MetaMask, Rainbow, WalletConnect, etc.)

## Stack

- **Next.js 15** (app router, Turbopack)
- **React 19**, **TypeScript 5.7**
- **Tailwind CSS v4**
- **wagmi v2** + **viem v2** (contract interactions)
- **RainbowKit v2** (wallet UI)
- **TanStack Query v5** (data fetching)
- **Ponder** (on-chain indexer)

## License

MIT
