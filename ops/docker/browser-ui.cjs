const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const base = "http://127.0.0.1:" + (process.env.TRIXLOG_HTTP_PORT || "18081");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1050 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const name = "Fortaleza São João " + Date.now();
  let id;
  try {
    await page.goto(base + "/location/novo");
    await page.getByLabel("Nome do lugar").fill(name);
    await page.getByLabel("Latitude", { exact: true }).fill("91");
    await page.getByLabel("Longitude", { exact: true }).fill("-38.5277");
    assert.equal(
      await page.locator("#latitude").evaluate((el) => el.checkValidity()),
      false,
    );
    await page.getByLabel("Latitude", { exact: true }).fill("-3.7447");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      page.getByRole("button", { name: "Salvar lugar" }).click(),
    ]);
    await page.goto(base + "/location/listar");
    const button = page.locator("[data-place-id]").filter({ hasText: name });
    await button.waitFor();
    id = await button.getAttribute("data-place-id");
    await page
      .getByRole("heading", { name: "Seu mapa está quase pronto" })
      .waitFor();
    await button.click();
    await page.locator("#place-details").waitFor();
    assert.equal(await page.locator("#detail-name").textContent(), name);
    await page
      .getByText("Este lugar ainda não tem tags.", { exact: true })
      .waitFor();
    await page.getByLabel("Buscar lugar por nome").fill("inexistente-xyz");
    await page.locator("#search-empty").waitFor({ state: "visible" });
    assert.equal(await button.isVisible(), false);
    await page.getByLabel("Buscar lugar por nome").fill("");
    await page.locator("#plot-lat").fill("0");
    await page.locator("#plot-lng").fill("0");
    await page.getByRole("button", { name: "Localizar no mapa" }).click();
    assert.equal(
      await page.locator("#detail-coordinates").textContent(),
      "0.000000, 0.000000",
    );
    await page.goto(base + "/tag/novo");
    await page.getByLabel("Nome da tag").fill("Café <seguro>");
    await page.getByLabel("Lugar", { exact: true }).selectOption(id);
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      page.getByRole("button", { name: "Adicionar tag" }).click(),
    ]);
    await page.goto(base + "/location/listar");
    await page.locator(`[data-place-id="${id}"]`).click();
    await page.locator(".tag").filter({ hasText: "Café <seguro>" }).waitFor();
    assert.equal(await page.locator(".tag script, .tag img").count(), 0);
    await page.screenshot({
      path: "/tmp/trixlog-map-desktop.png",
      fullPage: true,
    });
    await page.goto(base + "/location/editar");
    await page.locator(`[data-edit-location="${id}"]`).click();
    await page.locator("#location-management").waitFor();
    await page.getByLabel("Nome do lugar").fill(name + " editado");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      page.getByRole("button", { name: "Salvar alterações" }).click(),
    ]);
    await page
      .locator("[data-edit-location]")
      .filter({ hasText: name + " editado" })
      .waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of [
      "/",
      "/location/novo",
      "/location/listar",
      "/location/editar",
      "/location/deletar",
      "/tag/novo",
    ]) {
      const response = await page.goto(base + path);
      assert.equal(response.status(), 200, path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      assert.equal(overflow, false, "mobile overflow " + path);
    }
    await page.goto(base + "/location/listar");
    await page.screenshot({
      path: "/tmp/trixlog-map-mobile.png",
      fullPage: true,
    });
    await page.goto(base + "/location/deletar");
    await page.locator(`[data-edit-location="${id}"]`).click();
    await page.locator("#location-management").waitFor();
    page.once("dialog", (dialog) => dialog.accept());
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      page.getByRole("button", { name: "Excluir este lugar" }).click(),
    ]);
    assert.equal(await page.locator(`[data-edit-location="${id}"]`).count(), 0);
    id = null; // Successful deletion needs no second cleanup request.
    assert.deepEqual(errors, []);
    console.log(
      "PASS: Chromium desktop/mobile, all six JSP pages, forms create/edit/delete, tags, UTF-8, coordinate limits/zero, search, missing API key, no horizontal overflow or JS exceptions",
    );
  } finally {
    if (id)
      await page.request.post(base + "/location/deletar/" + id, {
        form: { _method: "DELETE" },
      });
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
