"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { erc721ABI } from "wagmi";

const infuraRPC = "https://base-mainnet.infura.io/v3/84e6a231877a49598bc05167fe403466";
const publicClient = createPublicClient({
  chain: base,
  transport: http(infuraRPC),
});

export default function NFTViewer() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNFTs = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.basescan.org/api?module=account&action=tokennfttx&address=${address}`
      );
      const data = await response.json();

      const seen = new Set();
      const tokens = [];

      for (const tx of data.result || []) {
        const key = tx.contractAddress + ":" + tx.tokenID;
        if (!seen.has(key)) {
          seen.add(key);
          tokens.push({ contract: tx.contractAddress, tokenId: tx.tokenID });
        }
      }

      const results = await Promise.all(
        tokens.map(async ({ contract, tokenId }) => {
          let tokenURI;

          try {
            tokenURI = await publicClient.readContract({
              address: contract,
              abi: erc721ABI,
              functionName: "tokenURI",
              args: [tokenId],
            });
          } catch (err) {
            console.warn("tokenURI call failed:", contract, tokenId, err);
            return null;
          }

          if (!tokenURI || typeof tokenURI !== "string" || tokenURI.length === 0) {
            console.warn("Invalid tokenURI:", contract, tokenId, tokenURI);
            return null;
          }

          const cleanUri = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");

          let metadata;
          try {
            const res = await fetch(cleanUri);
            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
            metadata = await res.json();
          } catch (err) {
            console.warn("Failed to fetch metadata:", cleanUri, err);
            return null;
          }

          return {
            tokenId,
            contract,
            name: metadata.name || `Token #${tokenId}`,
            image: metadata.image?.replace("ipfs://", "https://ipfs.io/ipfs/"),
          };
        })
      );

      setNfts(results.filter(Boolean));
    } catch (err) {
      console.error("Failed to fetch NFTs from BaseScan", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isConnected) fetchNFTs();
  }, [isConnected]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Your NFTs (Base)</h2>
      {loading ? (
        <p>Loading NFTs...</p>
      ) : nfts.length === 0 ? (
        <p>No NFTs found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((nft, i) => (
            <div key={i} className="border rounded p-4 shadow">
              {nft.image ? (
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="mb-2 w-full h-40 object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center text-sm text-gray-500">
                  No Image
                </div>
              )}
              <h3 className="text-sm font-semibold">{nft.name}</h3>
              <p className="text-xs text-gray-500 break-all">{nft.contract}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
