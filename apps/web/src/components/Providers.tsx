"use client"

import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { useState, type ReactNode } from "react"
import { config } from "@/lib/wagmi"

import "@rainbow-me/rainbowkit/styles.css"

const theme = lightTheme({
  accentColor: "#000000",
  accentColorForeground: "#FFFFFF",
  borderRadius: "medium",
  fontStack: "system",
})

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={theme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
