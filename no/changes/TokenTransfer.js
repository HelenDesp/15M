import { useState } from "react";
import { useSendTransaction } from "wagmi";
import { parseEther } from "viem";

export default function TokenTransfer() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const { sendTransaction, isSuccess, isLoading } = useSendTransaction();

  const handleSend = async () => {
    if (!to || !amount) return;
    try {
      await sendTransaction({
        to,
        value: parseEther(amount),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <input
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="Recipient"
        className="mb-2 border p-1 w-full"
      />
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in ETH"
        className="mb-2 border p-1 w-full"
      />
      <button
        onClick={handleSend}
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isLoading ? "Sending..." : "Send"}
      </button>
      {isSuccess && <p className="text-green-600 mt-2">Transaction sent!</p>}
    </div>
  );
}
