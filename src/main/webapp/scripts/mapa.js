"use strict";

(() => {
  const workspace = document.querySelector("#map-workspace");
  if (!workspace) return;
  const context = document.body.dataset.context || "";
  const places = [...document.querySelectorAll("[data-place-id]")];
  const message = document.querySelector("#map-message");
  const details = document.querySelector("#place-details");
  const tags = document.querySelector("#detail-tags");
  const status = document.querySelector("#detail-status");
  const markers = new Map();
  let map, Marker, preview, info;
  let selection;
  let loadTimer;
  let authFailed = false;

  function showMessage(title, description) {
    message.querySelector("h2").textContent = title;
    message.querySelector("p").textContent = description;
    message.hidden = false;
  }

  function validPosition(lat, lng) {
    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180
    );
  }

  function showDetails(name, lat, lng) {
    document.querySelector("#detail-name").textContent = name;
    document.querySelector("#detail-coordinates").textContent =
      `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    const link = document.querySelector("#detail-google-link");
    link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
    details.hidden = false;
  }

  function center(position, marker, title) {
    if (!map || authFailed) return;
    map.panTo(position);
    map.setZoom(16);
    const content = document.createElement("div");
    const heading = document.createElement("strong");
    heading.textContent = title;
    const coordinates = document.createElement("p");
    coordinates.textContent = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
    content.append(heading, coordinates);
    info.setContent(content);
    info.open({ map, anchor: marker });
  }

  async function selectPlace(button) {
    if (selection) selection.abort();
    const current = new AbortController();
    selection = current;
    const lat = Number(button.dataset.lat),
      lng = Number(button.dataset.lng);
    if (!validPosition(lat, lng)) return;
    places.forEach((item) => {
      item.classList.toggle("is-active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    showDetails(button.dataset.name, lat, lng);
    tags.replaceChildren();
    status.textContent = "Carregando tags…";
    const marker = markers.get(button.dataset.placeId);
    if (marker) center({ lat, lng }, marker, button.dataset.name);
    try {
      const response = await fetch(
        `${context}/tag/tags/${button.dataset.placeId}`,
        { signal: current.signal },
      );
      if (!response.ok)
        throw new Error(
          "Não foi possível carregar as tags. Selecione o lugar para tentar novamente.",
        );
      const names = await response.json();
      if (current.signal.aborted) return;
      names.forEach((name) => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = name;
        tags.append(tag);
      });
      status.textContent = names.length ? "" : "Este lugar ainda não tem tags.";
    } catch (error) {
      if (error.name !== "AbortError") status.textContent = error.message;
    }
  }

  document.querySelector("#place-count").textContent = String(
    places.length,
  ).padStart(2, "0");
  places.forEach((button) =>
    button.addEventListener("click", () => selectPlace(button)),
  );
  document.querySelector("#place-search").addEventListener("input", (event) => {
    const query = event.target.value.trim().toLocaleLowerCase("pt-BR");
    places.forEach((button) => {
      button.hidden = !button.dataset.name
        .toLocaleLowerCase("pt-BR")
        .includes(query);
    });
    document.querySelector("#search-empty").hidden =
      !places.length || places.some((button) => !button.hidden);
  });
  document.querySelector("#plot-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const lat = Number(document.querySelector("#plot-lat").value),
      lng = Number(document.querySelector("#plot-lng").value);
    if (!validPosition(lat, lng)) return;
    if (selection) selection.abort();
    places.forEach((button) => {
      button.classList.remove("is-active");
      button.setAttribute("aria-pressed", "false");
    });
    showDetails("Ponto explorado", lat, lng);
    tags.replaceChildren();
    status.textContent = "Prévia por coordenadas. Este ponto não foi salvo.";
    if (!map || authFailed) return;
    if (preview) preview.map = null;
    preview = new Marker({
      map,
      position: { lat, lng },
      title: "Ponto explorado",
    });
    center({ lat, lng }, preview, "Ponto explorado");
  });

  window.gm_authFailure = () => {
    authFailed = true;
    clearTimeout(loadTimer);
    showMessage(
      "Não foi possível autorizar o mapa",
      "Confira a chave, o faturamento e os domínios permitidos no Google Cloud. Seus lugares continuam disponíveis na lista.",
    );
  };

  window.initGeoPinMap = async () => {
    clearTimeout(loadTimer);
    try {
      const [{ Map: GoogleMap, InfoWindow }, { AdvancedMarkerElement }] =
        await Promise.all([
          google.maps.importLibrary("maps"),
          google.maps.importLibrary("marker"),
        ]);
      if (authFailed) return;
      Marker = AdvancedMarkerElement;
      map = new GoogleMap(document.querySelector("#map_canvas"), {
        center: { lat: -3.7447435, lng: -38.5277421 },
        zoom: 12,
        mapId: workspace.dataset.mapId || "DEMO_MAP_ID",
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
      info = new InfoWindow();
      const bounds = new google.maps.LatLngBounds();
      places.forEach((button) => {
        const lat = Number(button.dataset.lat),
          lng = Number(button.dataset.lng);
        if (!validPosition(lat, lng)) return;
        const marker = new Marker({
          map,
          position: { lat, lng },
          title: button.dataset.name,
        });
        marker.addListener("click", () => selectPlace(button));
        markers.set(button.dataset.placeId, marker);
        bounds.extend({ lat, lng });
      });
      if (markers.size > 1) map.fitBounds(bounds, 60);
      else if (markers.size === 1) map.setCenter(bounds.getCenter());
      message.hidden = true;
      const selected = places.find((button) =>
        button.classList.contains("is-active"),
      );
      if (selected)
        center(
          {
            lat: Number(selected.dataset.lat),
            lng: Number(selected.dataset.lng),
          },
          markers.get(selected.dataset.placeId),
          selected.dataset.name,
        );
    } catch (error) {
      showMessage(
        "O mapa não carregou",
        "Confira sua conexão e a configuração do Google Maps. Você pode continuar consultando seus lugares na lista.",
      );
    }
  };

  if (!workspace.dataset.apiKey.trim()) {
    showMessage(
      "Seu mapa está quase pronto",
      "A conexão com o Google Maps ainda não foi configurada. Você pode consultar seus lugares e abrir as coordenadas no Google Maps.",
    );
    return;
  }
  const source = new URL("https://maps.googleapis.com/maps/api/js");
  source.search = new URLSearchParams({
    key: workspace.dataset.apiKey,
    loading: "async",
    callback: "initGeoPinMap",
    v: "quarterly",
    language: "pt-BR",
    region: "BR",
  });
  const script = document.createElement("script");
  script.src = source.toString();
  script.async = true;
  script.onerror = () => {
    clearTimeout(loadTimer);
    showMessage(
      "Sem conexão com o mapa",
      "O Google Maps não respondeu. Confira a conexão e recarregue a página.",
    );
  };
  loadTimer = window.setTimeout(
    () =>
      showMessage(
        "O mapa está demorando para responder",
        "Confira a conexão e a configuração do Google Maps. A lista de lugares continua disponível.",
      ),
    20000,
  );
  document.head.append(script);
})();
