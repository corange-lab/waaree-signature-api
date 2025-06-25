const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Root route to confirm app is live
app.get('/', (req, res) => {
  res.send('✅ Waaree Signature API is running. Use /generate-signature');
});

// ✅ Signature generation route (mocked)
app.get('/generate-signature', async (req, res) => {
  const { stationID, timestamp, timezone = 'Asia/Calcutta' } = req.query;

  if (!stationID || !timestamp) {
    return res.status(400).json({ error: 'Missing stationID or timestamp' });
  }

  // ⛔ Replace this mocked value with actual WASM logic later
  const mockedSignature = `mocked-${stationID.slice(0, 5)}-${timestamp.slice(-5)}`;

  res.json({
    signature: mockedSignature,
    timestamp,
    stationID
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
