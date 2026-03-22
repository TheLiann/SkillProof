import { useState, useEffect } from "react";
import {
  Connection,
  clusterApiUrl,
  Transaction,
  SystemProgram,
  PublicKey,
} from "@solana/web3.js";

function App() {
  const [status, setStatus] = useState("No challenge completed yet.");
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const connection = new Connection(clusterApiUrl("devnet"));

  const connectWallet = async () => {
    try {
      const solana = (window as {
        solana?: {
          isPhantom?: boolean;
          connect: (args?: {
            onlyIfTrusted?: boolean;
          }) => Promise<{ publicKey: { toString: () => string } }>;
        };
      }).solana;

      if (!solana || !solana.isPhantom) {
        alert("Phantom no está instalado");
        return;
      }

      const response = await solana.connect();
      setWalletAddress(response.publicKey.toString());
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const solana = (window as {
          solana?: {
            isPhantom?: boolean;
            connect: (args?: {
              onlyIfTrusted?: boolean;
            }) => Promise<{ publicKey: { toString: () => string } }>;
          };
        }).solana;

        if (solana && solana.isPhantom) {
          const response = await solana.connect({ onlyIfTrusted: true });
          setWalletAddress(response.publicKey.toString());
        }
      } catch (err) {
        console.log("No trusted wallet connection found", err);
      }
    };

    checkConnection();
  }, []);

  const handleChallenge = async () => {
    try {
      if (!walletAddress) {
        setStatus("Connect wallet first ❌");
        return;
      }

      setStatus("Sending transaction... ⏳");

      const solana = (window as {
        solana?: {
          publicKey: PublicKey;
          signTransaction: (tx: Transaction) => Promise<Transaction>;
        };
      }).solana;

      if (!solana?.publicKey) {
        setStatus("Wallet not available ❌");
        return;
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: solana.publicKey,
          toPubkey: solana.publicKey,
          lamports: 1,
        })
      );

      transaction.feePayer = solana.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      const signed = await solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());

      await connection.confirmTransaction(signature, "confirmed");

      try {
  await fetch("https://glowing-barnacle-v6x657jqgjpj275q-4000.app.github.dev/api/verify-challenge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      walletAddress,
      challengeId: "challenge-001",
    }),
  });
} catch (backendErr) {
  console.error("Backend verify error:", backendErr);
}

      setChallengeCompleted(true);
      setStatus(`Challenge verified on-chain ✅ Tx: ${signature}`);
    } catch (err) {
  console.error("Challenge error:", err);
  setStatus(`Transaction failed ❌ ${String(err)}`);
}
  };

  const handleMint = async () => {
    try {
      if (!challengeCompleted) {
        setStatus("Complete the challenge first ❌");
        return;
      }

      if (!walletAddress) {
        setStatus("Connect wallet first ❌");
        return;
      }

      setStatus("Minting Skill NFT... ⏳");

      const solana = (window as {
        solana?: {
          publicKey: PublicKey;
          signTransaction: (tx: Transaction) => Promise<Transaction>;
        };
      }).solana;

      if (!solana?.publicKey) {
        setStatus("Wallet not available ❌");
        return;
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: solana.publicKey,
          toPubkey: solana.publicKey,
          lamports: 1,
        })
      );

      transaction.feePayer = solana.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      const signed = await solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());

      await connection.confirmTransaction(signature, "confirmed");

      try {
  await fetch("https://glowing-barnacle-v6x657jqgjpj275q-4000.app.github.dev/api/mint-record", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      walletAddress,
      challengeId: "challenge-001",
      txHash: signature,
    }),
  });
} catch (backendErr) {
  console.error("Backend mint error:", backendErr);
}
      setStatus(`NFT Minted 🎉 Tx: ${signature}`);
    } catch (err) {
  console.error("Mint error:", err);
  setStatus(`Mint failed ❌ ${String(err)}`);
}
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #020617 0%, #0f172a 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            padding: "8px 14px",
            borderRadius: "999px",
            background: "rgba(59, 130, 246, 0.12)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            color: "#60a5fa",
            fontSize: "14px",
            marginBottom: "20px",
          }}
        >
          Decentralized Skill Verification
        </div>

        <h1
          style={{
            fontSize: "56px",
            fontWeight: "bold",
            lineHeight: 1.1,
            marginBottom: "20px",
            background: "linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Prove Your Skills On-Chain
        </h1>

        <p
          style={{
            fontSize: "22px",
            color: "#cbd5e1",
            maxWidth: "780px",
            margin: "0 auto 32px auto",
            lineHeight: 1.6,
          }}
        >
          Complete real-world challenges, earn verifiable NFT credentials, and
          build an immutable reputation in the blockchain ecosystem.
        </p>

        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={connectWallet}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid #60a5fa",
              background: "transparent",
              color: "#60a5fa",
              cursor: "pointer",
            }}
          >
            {walletAddress
              ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
              : "Connect Wallet"}
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "14px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleChallenge}
            style={{
              padding: "14px 22px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              color: "white",
              fontWeight: "bold",
              background: "linear-gradient(90deg, #2563eb, #9333ea)",
            }}
          >
            Complete Challenge
          </button>

          <button
            onClick={handleMint}
            style={{
              padding: "14px 22px",
              borderRadius: "12px",
              border: "1px solid rgba(96, 165, 250, 0.4)",
              cursor: "pointer",
              color: "#60a5fa",
              fontWeight: "bold",
              background: "transparent",
            }}
          >
            Mint Skill NFT
          </button>
        </div>

        <div
          style={{
            marginTop: "24px",
            fontSize: "18px",
            fontWeight: "bold",
            color: challengeCompleted ? "#4ade80" : "#f87171",
          }}
        >
          {status}
        </div>

        {walletAddress && (
          <p style={{ marginTop: "10px", color: "#4ade80" }}>
            Wallet: {walletAddress}
          </p>
        )}

        <div
          style={{
            marginTop: "16px",
            color: "#94a3b8",
            fontSize: "15px",
          }}
        >
          Challenge status: {challengeCompleted ? "Completed ✅" : "Pending ⏳"}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginTop: "60px",
            textAlign: "left",
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "18px",
              padding: "22px",
            }}
          >
            <h3 style={{ marginBottom: "10px", fontSize: "20px" }}>
              NFT Credentials
            </h3>
            <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>
              Earn verifiable NFT certificates for completed challenges and prove
              your skills publicly on Solana.
            </p>
          </div>

          <div
            style={{
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(168, 85, 247, 0.2)",
              borderRadius: "18px",
              padding: "22px",
            }}
          >
            <h3 style={{ marginBottom: "10px", fontSize: "20px" }}>
              Public Verification
            </h3>
            <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>
              Anyone can verify your credentials on-chain without middlemen,
              proving trust through blockchain records.
            </p>
          </div>

          <div
            style={{
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(236, 72, 153, 0.2)",
              borderRadius: "18px",
              padding: "22px",
            }}
          >
            <h3 style={{ marginBottom: "10px", fontSize: "20px" }}>
              On-Chain Reputation
            </h3>
            <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>
              Build a decentralized reputation that can follow you across the
              entire Web3 ecosystem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;