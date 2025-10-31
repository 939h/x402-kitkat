import express from 'express';
import { X402 } from '@coinbase/x402';

const app = express();
app.use(express.json());

const x402 = new X402({
  payTo: "coinbase",  // Coinbase sends USDC to your wallet
  asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',  // Base USDC
  network: 'base',
  rpcUrl: 'https://base-mainnet.g.alchemy.com/v2/demo',  // Free RPC
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
      return res.status(200).json({
        message: `Payment received! Minting 5000 tokens for $${tier.amount / 1000000}...`
      });
    }
  } catch (error) {
    console.error('Verification failed:', error.message);
  }

  return x402.quote(res, TIERS.map(t => ({
    amount: t.amount,
    description: t.description
  })));
});

app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: Arial; text-align: center; padding: 40px; background: #000; color: #0f0;">
      <h1>KITKAT SEND — LIVE</h1>
      <p><strong>Wallet:</strong> 0x853f424c5eDc170C57caA4De3dB4df0c52877524</p>
      <p><strong>Pay:</strong> $1.00 / $0.20 / $0.01 → 5000 Tokens</p>
      <p>
        <a href="https://www.x402scan.com/recipient/0x853f424c5eDc170C57caA4De3dB4df0c52877524" 
           style="color: #0ff; font-weight: bold;">
          PAY NOW ON x402scan
        </a>
      </p>
      <hr>
      <p><em>Powered by Coinbase x402 v0.7.0</em></p>
    </div>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Kitkat Send running on port ${PORT}`);
});
