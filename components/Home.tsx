"use client";

import { useAccount, useConnect } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";
import Header from "./Header";
import Swap from "./Swap";

function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const consoleConnect = () => {
    console.log("connect");
    try {
      connect({
        connector: coinbaseWallet({
          appName: "DEX_Swap",
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div id="app" className="App">
      <Header
        address={address}
        isConnected={isConnected}
        connect={consoleConnect}
      />
      <div className="mainWindow">
        <Swap address={address} isConnected={isConnected} />
      </div>
    </div>
  );
}

export default Home;
