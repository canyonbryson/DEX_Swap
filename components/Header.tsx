"use client";

import Image from "next/image";
import Link from "next/link";

function Header(props: {
  address: string | undefined;
  isConnected: boolean;
  connect: () => void;
}) {
  const { address, isConnected, connect } = props;

  return (
    <header>
      <div className="leftH">
        <Image
          width={80}
          height={80}
          src={"/moralis-logo.svg"}
          alt="logo"
          className="logo"
        />
        <Link href="/" className="link">
          <div className="headerItem">Swap</div>
        </Link>
        {/* <Link href="/tokens" className="link">
          <div className="headerItem">Tokens</div>
        </Link> */}
      </div>
      <div className="rightH">
        <div className="headerItem">
          <Image
            width={80}
            height={80}
            src={"/eth.svg"}
            alt="eth"
            className="eth"
          />
          Ethereum
        </div>
        <button className="connectButton" onClick={connect}>
          {isConnected
            ? address!.slice(0, 4) + "..." + address!.slice(38)
            : "Connect"}
        </button>
      </div>
    </header>
  );
}

export default Header;
