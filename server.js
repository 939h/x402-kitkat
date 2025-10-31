import express from 'express';
import { X402 } from '@coinbase/x402';

const app = express();
app.use(express.json());

// === YOUR WALLET & CONFIG ===
const YOUR_WALLET = '0x853f424c5eDc170C57caA4De3dB4df0c52877524'; // ← YOU GET PAID
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base USDC
const RPC = 'https://base-mainnet.g.alchemy.com/v2/demo';

// === x402 — COINBASE FACILITATOR ===
const x402 = new X402({
  payTo: "coinbase",  // ← COINBASE SENDS TO YOUR WALLET
  asset: USDC,
  network: 'base',
  rpcUrl: RPC
});

// === PRICING TIERS ===
const TIERS = [
  { amount: '1000000', description: 'Mint 5000 tokens — $1.00' },
  { amount: '200000',  description: 'Mint 1000 tokens — $0.20' },
  { amount: '10000',   description: 'Mint 50 tokens — $0.01' }
];

// === /send ENDPOINT ===
app.post('/send', async (req, res) => {
  const { txHash } = req.body || {};

  if (!txHash) {
    return x402.quote(res, TIERS.map(t => ({
      amount: t.amount,
      description: t.description
    })));
  }

  try {
    const valid = await x402.verify(txHash, TIERS.map(t => t.amount));
    if (valid) {
      const tier = TIERS.find(t => t.amount === valid.amount);
      return res.json({ message: `Paid $${tier.amount / 1000000}! Minting 5000 tokens...` });
    }
  } catch (e) {
    console.error(e);
  }

  return x402.quote(res, TIERS.map(t => ({ amount: t.amount, description: t.description })));
});

// === HOME PAGE ===
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: Arial; text-align: center; padding: 40px; background: #000; color: #0f0;">
      <h1>KITKAT SEND — LIVE</h1>
      <p><strong>Wallet:</strong> <code>${YOUR_WALLET}</code></p>
      <p><strong>Pay:</strong> $1.00 / $0.20 / $0.01 → 5000 Tokens</p>
      <p>
        <a href="https://www.x402scan.com/recipient/${YOUR_WALLET}" 
           style="color: #0ff; font-weight: bold;">
          PAY NOW ON x402scan
        </a>
      </p>
      <hr>
      <p><em>Coinbase sends USDC to your wallet</em></p>
    </div>
  `);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Kitkat Send LIVE');
});
