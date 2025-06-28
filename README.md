# Waaree Signature API

### ✅ What it Does
- Logs in to Waaree portal using Puppeteer
- Grabs `signature`, `timestamp`, `token`, and `cookie`
- Saves it in `signature.json`
- Public API `/signature` serves fresh headers every 5 mins

### 🛠 How to Use

1. Rename `.env.example` to `.env` and enter your Waaree credentials
2. Push to GitHub
3. Deploy to Render:
   - Web Service: `index.js`
   - Background Worker: `cron.js`
4. Set Scheduled Job on Render:
   ```
   npm run update
   ```
   → Every 5 mins

### 🔁 Output
Call:
```
GET /signature
```

Get:
```json
{
  "signature": "...",
  "timestamp": "...",
  "token": "...",
  "cookie": "..."
}
```
