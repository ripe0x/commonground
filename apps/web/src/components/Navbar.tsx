"use client"

import Link from "next/link"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { SITE_TITLE } from "@commonground/shared"
import { useAccount } from "wagmi"

export function Navbar() {
  const { address } = useAccount()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <nav className="mx-auto flex h-16 max-w-[2000px] items-center justify-between px-6">
        {/* Left: logo / wordmark */}
        <Link href="/" className="text-lg font-medium tracking-tight">
          {SITE_TITLE}
        </Link>

        {/* Center: search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <Link
            href="/search"
            className="flex w-full items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-200"
          >
            <SearchIcon />
            <span>Search</span>
            <kbd className="ml-auto hidden rounded bg-white px-1.5 py-0.5 text-xs text-gray-400 border border-gray-200 lg:inline-block">
              ⌘K
            </kbd>
          </Link>
        </div>

        {/* Right: nav links + wallet */}
        <div className="flex items-center gap-6">
          <Link
            href="/activity"
            className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-black sm:inline-block"
          >
            Activity
          </Link>
          {address && (
            <Link
              href="/profile"
              className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-black sm:inline-block"
            >
              Profile
            </Link>
          )}
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus="avatar"
          />
        </div>
      </nav>
    </header>
  )
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}
