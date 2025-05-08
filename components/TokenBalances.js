import React, { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { fetchBalance } from "@wagmi/core";
import Image from "next/image";

const popularTokens = {
  8453: [
	{
	  symbol: "USDT",
	  name: "Tether USD",
	  address: "0x2d1673F7D18dD8E7F040f013f4a89E08A9E7c4dD",
	  decimals: 6,
	  logo: "usdt.svg", // Assuming you have this in /public/tokens/
	},    
	{
      symbol: "USDC",
      name: "USD Coin",
      address: "0xD9AA4D20eDdbA6F8f43b20A1d5D9964cCEF6cF07",
      decimals: 6,
      logo: "usdc.svg",
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      address: "0x6a7661795c374c0bfc635934efaddff3a7ee23b6",
      decimals: 18,
      logo: "dai.svg",
    }
  ]
};

export default function TokenBalances() {
  const { address } = useAccount();
  const { chain } = useChainId();
  const [balances, setBalances] = useState([]);
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    const chainId = chain?.id;
    if (chainId && popularTokens[chainId]) {
      setTokens(popularTokens[chainId]);
    } else {
      // Default to Base (8453)
      setTokens(popularTokens[8453] || []);
    }
  }, [chain]);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!address || tokens.length === 0) return;

      const promises = tokens.map((token) =>
        fetchBalance({
          address,
          token: token.address,
        })
          .then((res) => ({
            ...token,
            value: res.formatted,
          }))
          .catch(() => ({
            ...token,
            value: "0",
          }))
      );

      const results = await Promise.all(promises);
      setBalances(results);
    };

    fetchBalances();
  }, [address, tokens]);

  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-5 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Token Balances
      </h2>

      {balances.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No token balances found.
        </p>
      ) : (
        <ul className="space-y-3">
          {balances.map((token, idx) => (
            <li key={idx} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {token.logo && (
                  <Image
                    src={`/tokens/${token.logo}`}
                    alt={token.symbol}
                    width={24}
                    height={24}
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {token.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {token.symbol}
                  </p>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {token.value}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
