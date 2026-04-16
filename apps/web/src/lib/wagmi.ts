import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { mainnet, base } from "wagmi/chains"
import { http } from "wagmi"

// WalletConnect requires a projectId. Get one free at https://cloud.walletconnect.com
// For local dev without one, we use a placeholder that disables WC but still allows injected wallets.
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "PLACEHOLDER_DEV_ID"

export const config = getDefaultConfig({
  appName: "CommonGround",
  projectId,
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http(
      process.env.NEXT_PUBLIC_ALCHEMY_MAINNET_URL ??
        "https://eth.llamarpc.com"
    ),
    [base.id]: http(
      process.env.NEXT_PUBLIC_ALCHEMY_BASE_URL ??
        "https://base.llamarpc.com"
    ),
  },
  ssr: true,
})
