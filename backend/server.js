const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Base de datos en memoria (para el hackathon)
const credentials = [];
const verifiedChallenges = [];

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SkillProof backend running",
    timestamp: new Date().toISOString(),
  });
});

// Verificar challenge
app.post("/api/verify-challenge", (req, res) => {
  const { walletAddress, challengeId } = req.body;

  if (!walletAddress || !challengeId) {
    return res.status(400).json({
      success: false,
      message: "walletAddress and challengeId are required",
    });
  }

  const record = {
    id: verifiedChallenges.length + 1,
    walletAddress,
    challengeId,
    verified: true,
    verifiedAt: new Date().toISOString(),
  };

  verifiedChallenges.push(record);

  res.json({
    success: true,
    message: "Challenge verified successfully",
    data: record,
  });
});

// Registrar mint
app.post("/api/mint-record", (req, res) => {
  const { walletAddress, challengeId, txHash } = req.body;

  if (!walletAddress || !challengeId || !txHash) {
    return res.status(400).json({
      success: false,
      message: "walletAddress, challengeId and txHash are required",
    });
  }

  const credential = {
    id: credentials.length + 1,
    walletAddress,
    challengeId,
    txHash,
    mintedAt: new Date().toISOString(),
    type: "Skill NFT Credential",
  };

  credentials.push(credential);

  res.json({
    success: true,
    message: "Credential recorded successfully",
    data: credential,
  });
});

// Obtener credenciales por wallet
app.get("/api/credentials/:walletAddress", (req, res) => {
  const { walletAddress } = req.params;

  const walletCredentials = credentials.filter(
    (item) => item.walletAddress === walletAddress
  );

  res.json({
    success: true,
    count: walletCredentials.length,
    data: walletCredentials,
  });
});

app.listen(PORT, () => {
  console.log(`SkillProof backend running on http://localhost:${PORT}`);
});