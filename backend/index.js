import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { findByHash, appendResult } from './googleSheets.js';
import { hashImageBase64 } from './utils/hashImage.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*'}));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'mbti-backend', time: new Date().toISOString() });
});

// Body: { name, mbti, score, imageHash? , imageBase64? }
app.post('/api/submit', async (req, res) => {
  try {
    const { name, mbti, score, imageHash, imageBase64 } = req.body || {};

    if (!name || !mbti || typeof score === 'undefined') {
      return res.status(400).json({ error: 'Missing required fields: name, mbti, score' });
    }

    let finalHash = imageHash;
    if (!finalHash && imageBase64) {
      try {
        finalHash = hashImageBase64(imageBase64);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid imageBase64 provided' });
      }
    }

    if (!finalHash) {
      return res.status(400).json({ error: 'imageHash or imageBase64 is required' });
    }

    // Check duplicate
    const exists = await findByHash(finalHash);
    if (exists) {
      return res.status(409).json({ error: 'Duplicate submission detected', duplicate: true });
    }

    // Append to Google Sheets
    const now = new Date();
    await appendResult({
      name,
      mbti,
      score,
      imageHash: finalHash,
      date: now.toISOString().split('T')[0],
    });

    res.status(201).json({ ok: true, duplicate: false });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
