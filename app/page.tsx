"use client";

import Home from "@/components/Home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { mainnet } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

const queryClient = new QueryClient();

const config = createConfig({
  chains: [mainnet],
  connectors: [
    coinbaseWallet({
      appName: "DEX_Swap",
    }),
  ],
  transports: {
    [mainnet.id]: http(),
  },
});

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
