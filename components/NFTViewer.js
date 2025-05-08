"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function NFTViewer() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNFTs = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=base&format=decimal&limit=20`,
        {
          headers: {
            accept: "application/json",
            "X-API-Key": process.env.NEXT_PUBLIC_MORALIS_API_KEY,
          },
        }
      );
      const data = await response.json();
      const items = await Promise.all(
        data.result.map(async (nft) => {
          let metadata = {};
          try {
            if (nft.metadata) {
              metadata = JSON.parse(nft.metadata);
            } else if (nft.token_uri) {
              const res = await fetch(nft.token_uri);
              metadata = await res.json();
            }
          } catch (e) {
            console.warn("Failed to parse or fetch metadata:", nft.token_uri, e);
            metadata = {};
          }

          const image = metadata.image?.startsWith("ipfs://")
            ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
            : metadata.image;

          return {
            tokenId: nft.token_id,
            name: metadata.name || `Token #${nft.token_id}`,
            image,
            contract: nft.token_address,
          };
        })
      );
      setNfts(items.filter((n) => n.image));
    } catch (err) {
      console.error("Failed to fetch NFTs from Moralis", err);
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
