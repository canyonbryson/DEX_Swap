"use server";

import Moralis from "moralis";

export async function allowance(query: {
  tokenAddress: string;
  walletAddress: string;
}) {
  const response = await fetch(
    "https://api.1inch.dev/swap/v6.0/1/approve/allowance" +
      "?tokenAddress=" +
      query.tokenAddress +
      "&walletAddress=" +
      query.walletAddress,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_1INCH_API_KEY}`,
      },
    }
  );

  const data = await response.json();
  return data;
}

export async function transaction(query: { tokenAddress: string }) {
  const response = await fetch(
    `https://api.1inch.dev/swap/v6.0/1/approve/transaction?tokenAddress=${query.tokenAddress}`, //amount?
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_1INCH_API_KEY}`,
      },
    }
  );

  console.log("response: ", response);
  //response.body is a readable stream, but not valid json

  const data = await response.json();

  console.log("tx: ", data);
  return data;
}

export async function swap(query: {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  fromAddress: string;
  slippage: string;
}) {
  const response = await fetch(
    `https://api.1inch.dev/swap/v6.0/1/swap?fromTokenAddress=${query.fromTokenAddress}&toTokenAddress=${query.toTokenAddress}&amount=${query.amount}&fromAddress=${query.fromAddress}&slippage=${query.slippage}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_1INCH_API_KEY}`,
      },
    }
  );

  const data = await response.json();
  return data;
}

export async function getTokenPrice(query: {
  addressOne: string;
  addressTwo: string;
}) {
  try {
    await Moralis.start({ apiKey: process.env.MORALIS_KEY });
  } catch (error) {}
  console.log(query);

  const responseOne = await Moralis.EvmApi.token.getTokenPrice({
    address: query.addressOne,
  });

  const responseTwo = await Moralis.EvmApi.token.getTokenPrice({
    address: query.addressTwo,
  });

  const usdPrices = {
    tokenOne: responseOne.raw.usdPrice,
    tokenTwo: responseTwo.raw.usdPrice,
    ratio: responseOne.raw.usdPrice / responseTwo.raw.usdPrice,
  };

  return usdPrices;
}
