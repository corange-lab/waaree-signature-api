const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://digital.waaree.com/login');

  await page.type('#username', process.env.WAAREE_USER);
  await page.type('#password', process.env.WAAREE_PASS);
  await Promise.all([
    page.click('#loginBtn'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);

  let captured = {};

  page.on('request', req => {
    const url = req.url();
    if (url.includes('/plant/earnings/detail')) {
      const h = req.headers();
      captured = {
        signature: h['signature'],
        token: h['token'],
        timestamp: h['timestamp'],
        cookie: h['cookie']
      };
    }
  });

  await page.goto('https://digital.waaree.com/bus/dataView');
  await page.waitForTimeout(5000);

  fs.writeFileSync('signature.json', JSON.stringify(captured, null, 2));
  console.log('✅ signature.json updated');

  await browser.close();
})();
