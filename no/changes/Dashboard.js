import WalletInfoCard from "./WalletInfoCard";
import TokenBalances from "./TokenBalances";
import TokenTransfer from "./TokenTransfer";
import NFTViewer from "./NFTViewer";

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <WalletInfoCard />
        <TokenBalances />
        <TokenTransfer />
      </div>
      <NFTViewer />
    </div>
  );
}
