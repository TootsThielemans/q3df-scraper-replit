const express = require("express");
const puppeteer = require("puppeteer");
const chromium = require("chromium");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    message: "Q3DF Scraper API",
    endpoints: [{ path: "/q3df", method: "GET", params: "?id=profileId (optional)" }]
  });
});

app.get("/q3df", async (req, res) => {
  let browser;
  try {
    const profileId = req.query.id || "10052";
    if (!/^\d+$/.test(profileId)) return res.status(400).json({error:"Profile ID must be numeric"});
    const url = `https://www.q3df.org/profil?id=${profileId}`;

    browser = await puppeteer.launch({
      executablePath: chromium.path,
      headless: "new",
      args: ["--no-sandbox","--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForSelector("table", {timeout:10000});
    await page.click("th:nth-child(1)");
    await page.waitForTimeout(300);
    await page.click("th:nth-child(1)");
    await page.waitForTimeout(1000);

    const rows = await page.$$eval("table tbody tr", trs =>
      trs.slice(0,20).map(tr => {
        const tds = tr.querySelectorAll("td");
        return {
          date: tds[0]?.innerText.trim(),
          map: tds[1]?.innerText.trim(),
          time: tds[2]?.innerText.trim(),
          rank: tds[3]?.innerText.trim(),
          physic: tds[4]?.innerText.trim(),
          server: tds[5]?.innerText.trim()
        };
      })
    );

    res.json(rows);
  } catch(err) {
    console.error("Error scraping Q3DF:", err);
    res.status(500).json({error:"Failed to scrape data", details: err.message});
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on ${PORT}`));
