const express = require('express');
const { generateSignature } = require('./signature');
const app = express();

app.get('/generate-signature', async (req, res) => {
  const { stationID, timestamp, timezone = 'Asia/Calcutta' } = req.query;
  if (!stationID || !timestamp) {
    return res.status(400).json({ error: 'Missing required params' });
  }

  try {
    const signature = await generateSignature(stationID, timestamp, timezone);
    res.json({ signature, timestamp, stationID });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Signature generation failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
