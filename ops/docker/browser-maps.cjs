const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const base = "http://127.0.0.1:" + (process.env.TRIXLOG_HTTP_PORT || "18081");
const stub = `
(() => {
window.__mapTest={markers:[],libraries:[],options:null,center:null,zoom:null};
class Map {constructor(el,options){window.__mapTest.options=options;} panTo(p){window.__mapTest.center=p;} setZoom(z){window.__mapTest.zoom=z;} fitBounds(){} setCenter(p){window.__mapTest.center=p;}}
class InfoWindow {setContent(content){window.__mapTest.info=content.textContent;} open(){}}
class AdvancedMarkerElement {constructor(options){Object.assign(this,options);window.__mapTest.markers.push(this);} addListener(type,handler){this.handler=handler;}}
window.google={maps:{importLibrary:async name=>{window.__mapTest.libraries.push(name);return name==='maps'?{Map,InfoWindow}:{AdvancedMarkerElement};},LatLngBounds:class {extend(){} getCenter(){return {lat:0,lng:0}}}}};
window.initTrixlogMap();
})();`;
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let id;
  try {
    const name = "Maps browser " + Date.now();
    await page.request.post(base + "/location/cadastrar", {
      form: { name, latitude: "-3.74", longitude: "-38.52" },
    });
    await page.goto(base + "/location/listar");
    id = await page
      .locator("[data-place-id]")
      .filter({ hasText: name })
      .getAttribute("data-place-id");
    await page.route("**/location/listar", async (route) => {
      const response = await route.fetch();
      await route.fulfill({
        response,
        body: (await response.text()).replace(
          'data-api-key=""',
          'data-api-key="browser-test-key"',
        ),
      });
    });
    await page.route(
      "https://maps.googleapis.com/maps/api/js?*",
      async (route) => {
        const u = new URL(route.request().url());
        assert.equal(u.protocol, "https:");
        assert.equal(u.searchParams.get("loading"), "async");
        assert.equal(u.searchParams.has("sensor"), false);
        await route.fulfill({ contentType: "text/javascript", body: stub });
      },
    );
    await page.goto(base + "/location/listar");
    await page.waitForFunction(
      () => window.__mapTest && window.__mapTest.markers.length > 0,
    );
    assert.equal(await page.locator("#map-message").isVisible(), false);
    await page.locator(`[data-place-id="${id}"]`).click();
    assert.deepEqual(await page.evaluate(() => window.__mapTest.center), {
      lat: -3.74,
      lng: -38.52,
    });
    await page.locator("#plot-lat").fill("-90");
    await page.locator("#plot-lng").fill("180");
    await page.getByRole("button", { name: "Localizar no mapa" }).click();
    assert.deepEqual(await page.evaluate(() => window.__mapTest.center), {
      lat: -90,
      lng: 180,
    });
    assert.equal(
      await page.evaluate(() => window.__mapTest.markers.at(-1).position.lat),
      -90,
    );
    assert.deepEqual(await page.evaluate(() => window.__mapTest.libraries), [
      "maps",
      "marker",
    ]);
    assert.equal(
      await page.evaluate(() => window.__mapTest.options.mapId),
      "DEMO_MAP_ID",
    );
    await page.evaluate(() => window.gm_authFailure());
    await page
      .getByRole("heading", { name: "Não foi possível autorizar o mapa" })
      .waitFor();
    await page.unroute("https://maps.googleapis.com/maps/api/js?*");
    await page.route("https://maps.googleapis.com/maps/api/js?*", (route) =>
      route.abort(),
    );
    await page.reload();
    await page
      .getByRole("heading", { name: "Sem conexão com o mapa" })
      .waitFor();
    console.log(
      "PASS: mocked Maps API integration, async HTTPS loader, maps/marker libraries, AdvancedMarkerElement, saved coordinates, coordinate boundaries, map ID, auth failure and network failure. Does not validate Google credentials or real tiles.",
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
