const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const base = "http://127.0.0.1:" + (process.env.TRIXLOG_HTTP_PORT || "18081");

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    // Reproduce unavailable external fonts and an old cached, unversioned CSS.
    await page.route("https://fonts.googleapis.com/**", route => route.abort());
    await page.route("**/styles/custom.css", route => route.fulfill({
      contentType: "text/css", body: "/* old stylesheet */",
    }));
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/", "/location/listar", "/location/novo", "/location/editar", "/location/deletar", "/tag/novo"]) {
        await page.goto(base + path);
        const styles = await page.evaluate(() => ({
          header: getComputedStyle(document.querySelector(".site-header")).backgroundColor,
          font: getComputedStyle(document.body).fontFamily,
          overflow: document.documentElement.scrollWidth > innerWidth,
          css: document.querySelector('link[rel="stylesheet"]').href,
        }));
        assert.equal(styles.header, "rgb(21, 43, 43)", path);
        assert.match(styles.font, /system-ui/, path);
        assert.match(styles.css, /[?&]v=/, path);
        assert.equal(styles.overflow, false, path);
      }
    }
    console.log("PASS: seis telas em desktop/mobile, CSS versionado e fontes externas indisponíveis.");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
