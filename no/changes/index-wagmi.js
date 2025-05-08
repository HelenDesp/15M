import { createAppKit } from "@reown/appkit";
import { wagmiAdapter, projectId } from "./index-appkit";
import { base } from "@reown/appkit/networks";

const metadata = {
  name: "ReVerse Genesis",
  description: "ReVerse Genesis dApp on Base.",
  url: "https://reversegenesis.xyz",
  icons: ["https://reversegenesis.xyz/logo.png"],
};

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [base],
  defaultNetwork: base,
  metadata,
  features: {
    analytics: true,
  },
});
