const express = require('express');
const { generateSignature } = require('./signature');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Waaree Signature API is running. Use /generate-signature');
});

app.get('/generate-signature', async (req, res) => {
  const { stationID, timestamp, timezone = 'Asia/Calcutta' } = req.query;

  if (!stationID || !timestamp) {
    return res.status(400).json({ error: 'Missing stationID or timestamp' });
  }

  try {
    const signature = await generateSignature(stationID, timestamp, timezone);
    res.json({ signature, timestamp, stationID });
  } catch (err) {
    console.error('Signature generation error:', err);
    res.status(500).json({ error: 'Failed to generate signature' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
