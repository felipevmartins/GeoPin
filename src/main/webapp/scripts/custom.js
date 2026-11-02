"use strict";

(() => {
  const context = document.body.dataset.context || "";
  document.querySelectorAll(".site-header nav a").forEach((link) => {
    if (link.pathname === window.location.pathname)
      link.setAttribute("aria-current", "page");
  });
  const form = document.querySelector("#location-management");
  if (!form) return;
  const status = document.querySelector("#form-status");
  let request;
  document.querySelectorAll("[data-edit-location]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (request) request.abort();
      request = new AbortController();
      form.hidden = true;
      status.textContent = "Carregando lugar…";
      try {
        const response = await fetch(
          `${context}/location/buscar/${button.dataset.editLocation}`,
          { signal: request.signal },
        );
        if (!response.ok)
          throw new Error(
            "Não foi possível carregar o lugar. Tente novamente.",
          );
        const place = await response.json();
        form.elements.name.value = place.name;
        form.elements.latitude.value = place.latitude;
        form.elements.longitude.value = place.longitude;
        form.action = `${context}/location/${form.dataset.mode}/${place.id}`;
        form.querySelectorAll("input:not([type=hidden])").forEach((input) => {
          input.readOnly = form.dataset.mode === "deletar";
        });
        document.querySelectorAll("[data-edit-location]").forEach((item) => {
          item.classList.toggle("is-active", item === button);
          item.setAttribute("aria-pressed", String(item === button));
        });
        document.querySelector("#selection-hint").hidden = true;
        status.textContent = "";
        form.hidden = false;
      } catch (error) {
        if (error.name !== "AbortError") status.textContent = error.message;
      }
    });
  });
  form.addEventListener("submit", (event) => {
    if (
      form.dataset.mode === "deletar" &&
      !window.confirm("Excluir este lugar e todas as suas tags?")
    ) {
      event.preventDefault();
    }
  });
})();
