import { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { getContract } from "@/utils/contract";
import type { MetaMaskInpageProvider } from "@metamask/providers";
import toast from "react-hot-toast";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

export default function Home() {
  const [wallet, setWallet] = useState<string>("");
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [yesCount, setYesCount] = useState(0);
  const [noCount, setNoCount] = useState(0);
  // const [message, setMessage] = useState("");

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please open this in a browser with MetaMask installed.");
      return;
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setWallet(address);
    return { provider, signer };
  };

  // Cast a vote
  const vote = async (choice: 0 | 1) => {
    if (!wallet) return;
    setLoading(true);
    const votingToast = toast.loading("Submitting your vote...");

    try {
      const provider = new BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const contract = getContract(signer);

      const alreadyVoted = await contract.hasVoted(wallet);
      if (alreadyVoted) {
        toast.dismiss(votingToast);
        toast.error("You've already voted.");
      } else {
        const tx = await contract.castVote(choice);
        await tx.wait();
        toast.dismiss(votingToast);
        toast.success("✅ Vote submitted!");
        await fetchVotes(); // refresh results
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(votingToast);
      toast.error("❌ Voting failed.");
    }

    setLoading(false);
  };

  // Fetch current results

  const fetchVotes = async () => {
    if (!wallet || typeof window === "undefined" || !window.ethereum) return;

    const provider = new BrowserProvider(window.ethereum);
    const contract = getContract(provider);

    try {
      const [yes, no] = await contract.getResults();
      const voted: boolean = await contract.hasVoted(wallet);

      setYesCount(Number(yes));
      setNoCount(Number(no));
      setHasVoted(voted);
    } catch (error) {
      console.error("Failed to fetch vote results:", error);
    }
  };

  useEffect(() => {
    if (!wallet) return;

    const fetchVotes = async () => {
      if (typeof window === "undefined" || !window.ethereum) return;

      const provider = new BrowserProvider(window.ethereum);
      const contract = getContract(provider);

      try {
        const [yes, no] = await contract.getResults();
        const voted: boolean = await contract.hasVoted(wallet);

        setYesCount(Number(yes));
        setNoCount(Number(no));
        setHasVoted(voted);
      } catch (error) {
        console.error("Failed to fetch vote results:", error);
      }
    };

    fetchVotes();
  }, [wallet]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-gray-950 text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        🗳️ Simple Voting DApp
      </h1>
      <p className="mb-6">Yes or No. Vote once. Results live.</p>

      {!wallet ? (
        <button
          onClick={connectWallet}
          className="bg-blue-600 px-6 py-2 rounded-md text-white font-semibold hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <p className="text-sm mb-4">
            Connected: {wallet.slice(0, 6)}...{wallet.slice(-4)}
          </p>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => vote(0)}
              disabled={loading || hasVoted}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-md disabled:opacity-50"
            >
              ✅ Vote Yes
            </button>
            <button
              onClick={() => vote(1)}
              disabled={loading || hasVoted}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-md disabled:opacity-50"
            >
              ❌ Vote No
            </button>
          </div>

          {message && <p className="text-sm text-yellow-400 mb-4">{message}</p>}

          <div className="bg-white/5 p-4 rounded-lg text-sm">
            <p>✅ Yes: {yesCount}</p>
            <p>❌ No: {noCount}</p>
          </div>
        </>
      )}
    </div>
  );
}
