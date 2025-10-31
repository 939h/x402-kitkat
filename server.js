import express from 'express';
import { X402Client } from '@coinbase/x402';
const x402 = new X402Client({ ... });

const app = express();
app.use(express.json());

// === CONFIG ===
const WALLET = '0x853f424c5eDc170C57caA4De3dB4df0c52877524';
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const RPC = 'https://base-mainnet.g.alchemy.com/v2/demo';

const x402 = new X402({
  payTo: "coinbase",
  asset: USDC,
  network: 'base',
  rpcUrl: RPC
});

const TIERS = [
  { amount: '1000000', description: 'Mint 5000 tokens — $1.00' },
  { amount: '200000',  description: 'Mint 5000 tokens — $0.20' },
  { amount: '10000',   description: 'Mint 5000 tokens — $0.01' }
];

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
      return res.json({ message: `Paid $${tier.amount / 1000000}! Minting...` });
    }
  } catch (e) {
    console.error(e);
  }

  return x402.quote(res, TIERS.map(t => ({ amount: t.amount, description: t.description })));
});

app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: Arial; text-align: center; padding: 40px; background: #000; color: #0f0;">
      <h1>X402-KITKAT — LIVE</h1>
      <p><strong>Wallet:</strong> <code>${WALLET}</code></p>
      <p><strong>Pay:</strong> $1.00 / $0.20 / $0.01 → 5000 Tokens</p>
      <p>
        <a href="https://www.x402scan.com/recipient/${WALLET}" 
           style="color: #0ff; font-weight: bold;">
          PAY NOW
        </a>
      </p>
      <hr>
      <p><em>Coinbase sends USDC to your wallet</em></p>
    </div>
  `);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('x402-kitkat LIVE');
});
