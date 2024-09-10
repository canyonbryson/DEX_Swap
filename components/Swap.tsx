"use client";

import { tokenList } from "@/constants/tokenList";
import {
  allowance,
  getTokenPrice,
  swap,
  transaction,
} from "@/lib/price.action";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Input, Modal, Popover, Radio, RadioChangeEvent, message } from "antd";
import { ChangeEvent, useEffect, useState } from "react";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";

function Swap(props: { address: string | undefined; isConnected: boolean }) {
  const { address, isConnected } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState<number>();
  const [tokenTwoAmount, setTokenTwoAmount] = useState<number>();
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState<{
    ratio: number;
    fromTokenAddress: string;
    toTokenAddress: string;
    toTokenAmount: string;
  }>();
  const [txDetails, setTxDetails] = useState<{
    to: string | null;
    data: string | null;
    value: string | null;
  }>({
    to: null,
    data: null,
    value: null,
  });

  // const { data } = useEstimateGas({
  //   to: String(txDetails.to) as `0x$${string}`,
  //   value: BigInt(txDetails.value!), // parseEther('0.01'), //import parseEther from viem
  // });
  const { sendTransaction, data: hash } = useSendTransaction();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  function handleSlippageChange(e: RadioChangeEvent) {
    setSlippage(e.target.value);
  }

  function changeAmount(e: ChangeEvent<HTMLInputElement>) {
    setTokenOneAmount(parseFloat(e.target.value));
    if (e.target.value && prices) {
      setTokenTwoAmount(
        parseFloat((parseFloat(e.target.value) * prices.ratio).toFixed(2))
      );
    } else {
      setTokenTwoAmount(undefined);
    }
  }

  function switchTokens() {
    setPrices(undefined);
    setTokenOneAmount(undefined);
    setTokenTwoAmount(undefined);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two.address, one.address);
  }

  function openModal(asset: number) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(i: number) {
    setPrices(undefined);
    setTokenOneAmount(undefined);
    setTokenTwoAmount(undefined);
    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
      fetchPrices(tokenList[i].address, tokenTwo.address);
    } else {
      setTokenTwo(tokenList[i]);
      fetchPrices(tokenOne.address, tokenList[i].address);
    }
    setIsOpen(false);
  }

  async function fetchPrices(one: string, two: string) {
    const res = await getTokenPrice({ addressOne: one, addressTwo: two });

    setPrices({
      ratio: res.ratio,
      fromTokenAddress: res.tokenOne.toString(),
      toTokenAddress: two,
      toTokenAmount: res.tokenTwo.toString(),
    });
  }

  async function fetchDexSwap() {
    // const allowance = await axios.get(
    //   `https://api.1inch.dev/swap/v6.0/1/approve/allowance?tokenAddress=${tokenOne.address}&walletAddress=${address}`,
    //   {
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Access-Control-Allow-Origin": "*",
    //       Authorization: `Bearer ${process.env.NEXT_PUBLIC_1INCH_API_KEY}`,
    //     },
    //   }
    // );
    const allowanceRes = await allowance({
      tokenAddress: tokenOne.address,
      walletAddress: address as `0x${string}`,
    });

    if (allowanceRes.allowance === "0") {
      console.log("not approved");
      const approve = await transaction({ tokenAddress: tokenOne.address });

      setTxDetails(approve.data);
      console.log("not approved");
      return;
    }

    const tx = await swap({
      fromTokenAddress: tokenOne.address,
      toTokenAddress: tokenTwo.address,
      amount: tokenOneAmount!.toString(),
      fromAddress: address as `0x${string}`,
      slippage: slippage.toString(),
    });

    const decimals = Number(`1E${tokenTwo.decimals}`);
    setTokenTwoAmount(
      parseFloat((Number(tx.data.toTokenAmount) / decimals).toFixed(2))
    );

    setTxDetails(tx.data.tx);
  }

  useEffect(() => {
    fetchPrices(tokenList[0].address, tokenList[1].address);
  }, []);

  useEffect(() => {
    if (txDetails.to && isConnected) {
      sendTransaction({
        account: address as `0x${string}`,
        to: String(txDetails.to) as `0x${string}`,
        data: String(txDetails.data) as `0x${string}`,
        value: BigInt(txDetails.value!),
      });
    }
  }, [txDetails, isConnected, sendTransaction, address]);

  useEffect(() => {
    messageApi.destroy();

    if (isLoading) {
      messageApi.open({
        type: "loading",
        content: "Transaction is Pending...",
        duration: 0,
      });
    }
  }, [isLoading, messageApi]);

  useEffect(() => {
    messageApi.destroy();
    if (isSuccess) {
      messageApi.open({
        type: "success",
        content: "Transaction Successful",
        duration: 1.5,
      });
    } else if (txDetails.to) {
      messageApi.open({
        type: "error",
        content: "Transaction Failed",
        duration: 1.5,
      });
    }
  }, [isSuccess, messageApi, txDetails]);

  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className="modalContent">
          {tokenList?.map(
            (
              e: {
                img: string;
                ticker: string;
                name: string;
              },
              i: number
            ) => {
              return (
                <div
                  className="tokenChoice"
                  key={i}
                  onClick={() => modifyToken(i)}
                >
                  <img src={e.img} alt={e.ticker} className="tokenLogo" />
                  <div className="tokenChoiceNames">
                    <div className="tokenName">{e.name}</div>
                    <div className="tokenTicker">{e.ticker}</div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </Modal>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4 className="text-3xl font-bold m-2">Swap</h4>
          <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement="bottomRight"
          >
            <SettingOutlined className="cog" />
          </Popover>
        </div>
        <div className="inputs">
          <Input
            placeholder="0"
            value={tokenOneAmount!}
            onChange={changeAmount}
            disabled={!prices}
          />
          <Input placeholder="0" value={tokenTwoAmount!} disabled={true} />
          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className="switchArrow" />
          </div>
          <div className="assetOne" onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          <div className="assetTwo" onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt="assetOneLogo" className="assetLogo" />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
        </div>
        <button
          className="swapButton"
          disabled={!tokenOneAmount || !isConnected}
          onClick={fetchDexSwap}
        >
          Swap
        </button>
      </div>
    </>
  );
}

export default Swap;
