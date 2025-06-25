const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Waaree Signature API is running.');
});

app.get('/signature', (req, res) => {
  try {
    const json = fs.readFileSync('./signature.json', 'utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(JSON.parse(json));
  } catch (e) {
    res.status(500).json({ error: 'Failed to read signature' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
