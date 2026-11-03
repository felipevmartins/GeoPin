> Stack atual: Java25, Spring7 e Tomcat11. As evidências atuais estão em [Java25](../java-upgrade/java25/README.md); a seção de resultado abaixo registra a atualização anterior da interface.

# Google Maps e interface

A interface utiliza HTML semântico, JSP UTF-8, CSS responsivo e JavaScript nativo (sem jQuery/Bootstrap nas telas). Inclui lista pesquisável, detalhes com tags, todos os pontos salvos no mapa e prévia por coordenadas sem persistência. Os formulários mantêm as rotas existentes e validam os intervalos de latitude/longitude no navegador. Esses limites não substituem validação no servidor.

## Configurar o Google Maps

1. Crie/selecione um projeto no Google Cloud e habilite o faturamento e a **Maps JavaScript API**.
2. Crie uma chave para navegador. Restrinja a API a Maps JavaScript API e os referenciadores HTTP ao endereço utilizado, por exemplo `http://localhost:18081/*` e `http://127.0.0.1:18081/*`.
3. Copie `.env.example` para `.env` na raiz, preencha `GOOGLE_MAPS_API_KEY` e mantenha `GOOGLE_MAPS_MAP_ID=DEMO_MAP_ID` para os testes locais. `.env` é ignorado pelo Git. A chave de navegador é visível no HTML por definição; use as restrições do Google Cloud.
4. Execute `docker compose up -d --build --wait` e abra http://localhost:18081/location/listar.

Para uso fora dos testes, crie um **map ID do tipo JavaScript** no Google Cloud e substitua DEMO_MAP_ID. As variáveis podem ser fornecidas ao processo Java como `GOOGLE_MAPS_API_KEY`/`GOOGLE_MAPS_MAP_ID`, ou pelas propriedades JVM `maps.api.key`/`maps.map.id` (estas têm prioridade). Para outra porta use GEOPIN_HTTP_PORT tanto no Compose quanto nos testes e ajuste os referenciadores.

A aplicação usa carregamento assíncrono HTTPS, canal `quarterly`, `importLibrary('maps')` e `importLibrary('marker')`, e `AdvancedMarkerElement`. O parâmetro sensor e Marker legado foram retirados. Não usa Geocoding/Places: os pontos são posicionados diretamente por latitude/longitude. O clique mostra nome/coordenadas e consulta tags nos endpoints existentes. Se não houver chave, a lista e os detalhes permanecem disponíveis com um link para abrir as coordenadas no Google Maps. Falhas de rede/autorização possuem mensagens próprias.

## Testes de navegador opcionais

Além de `python3 ops/docker/smoke.py`, há regressão Chromium para as seis telas, formulários, busca, coordenadas e viewport móvel, e um teste da integração de JavaScript com a API simulada. A suíte browser-ui pressupõe GOOGLE_MAPS_API_KEY vazia; a simulação de browser-maps não consome a API Google.

Instale Playwright fora do projeto, por exemplo:

```sh
npm install --prefix /tmp/trixlog-browser playwright
/tmp/trixlog-browser/node_modules/.bin/playwright install --with-deps chromium
NODE_PATH=/tmp/trixlog-browser/node_modules node ops/docker/browser-css.cjs
NODE_PATH=/tmp/trixlog-browser/node_modules node ops/docker/browser-ui.cjs
NODE_PATH=/tmp/trixlog-browser/node_modules node ops/docker/browser-maps.cjs
```

Os testes criam registros únicos no banco Docker e removem seus registros ao terminar. Screenshots desktop/móvel são gravados em /tmp/geopin-map-desktop.png e /tmp/geopin-map-mobile.png. O teste simulado não comprova chave, faturamento, map ID de produção ou renderização dos mapas reais. A validação autenticada precisa ser feita com a chave do seu projeto Google Cloud.

## Fontes oficiais consultadas

- https://developers.google.com/maps/documentation/javascript/advanced-markers/migration — depreciação de Marker, biblioteca marker e map ID.
- https://developers.google.com/maps/documentation/javascript/load-maps-js-api — carregamento assíncrono e importLibrary.
- https://developers.google.com/maps/documentation/javascript/get-api-key — configuração da chave.

## Resultado observado

- Imagem reconstruída com sucesso em Java 21; app e PostgreSQL healthy.
- Smoke HTTP + PostgreSQL aprovado após a atualização (smoke.log).
- Chromium 1440×1050 e 390×844: seis JSPs renderizaram, criação/edição/exclusão e tags aprovadas, busca/filtro e coordenadas zero/limites aprovados, sem overflow horizontal ou exceções JavaScript (browser-ui.log).
- API Maps simulada: HTTPS/async, importLibrary maps/marker, marcadores, centralização, map ID, falhas de autorização/rede aprovadas (browser-maps.log). A simulação não usa tiles reais nem autenticação Google.
- Logs finais da aplicação sem ERROR, SEVERE ou Caused by. Revisão visual dos screenshots desktop/móvel realizada; ícones usam SVG para não depender da disponibilidade de glifos.
- Sem chave real disponível: mapa autenticado, faturamento e map ID de produção permanecem sem validação. Java 25 não foi alterado nesta tarefa.

## Correção do carregamento de CSS

Removido o `@import` de Google Fonts: uma resposta externa lenta impedia a aplicação do CSS local, reproduzido no Chromium com a requisição de fontes atrasada. A interface agora usa fontes do sistema e o link do CSS possui versão para invalidar o endereço anterior em cache. Ao alterar o CSS, atualize também esse parâmetro no header.jspf.

O teste browser-css verifica as seis telas em desktop e celular com fontes externas indisponíveis e simulação de CSS antigo no endereço sem versão. Resultado aprovado (browser-css.log); regressão funcional browser-ui também aprovada após reconstruir o container.
