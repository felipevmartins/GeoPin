# GeoPin

Aplicação web para cadastrar lugares por latitude e longitude, associar tags e visualizar os pontos no Google Maps. A interface utiliza JSP, CSS responsivo e JavaScript nativo, com busca de lugares e prévia de coordenadas.

## Stack

| Componente | Versão |
| --- | --- |
| Java / bytecode | 25 LTS / release 25 |
| Spring Framework | 7.0.10 |
| Hibernate ORM / Validator | 7.4.14.Final / 9.1.6.Final |
| Jackson | 3.2.4 |
| Tomcat | 11.0.27 |
| PostgreSQL / JDBC | 16 / 42.7.14 |
| Maven | 3.9.11 ou superior; imagem de build 3.10.0 |

A aplicação gera um WAR e utiliza APIs Jakarta. As imagens de build e Tomcat estão fixadas por digest no [Dockerfile](Dockerfile). Versões e decisões de compatibilidade estão no [relatório da migração Java 25](docs/java-upgrade/java25/README.md).

## Executar com Docker

Requisitos: Docker Engine e Docker Compose v2. O build no container dispensa Java e Maven no host.

```sh
cp .env.example .env
docker compose up -d --build --wait
```

Abra **http://localhost:18081/**. A aplicação e o PostgreSQL têm healthchecks; o banco usa volume persistente e fica acessível apenas na rede do Compose. As credenciais fixas do Compose são destinadas ao ambiente local de teste.

Para outra porta, defina `GEOPIN_HTTP_PORT` no `.env`. O Hibernate inicializa o banco vazio com `update`; para verificar um esquema existente sem alterá-lo, execute:

```sh
GEOPIN_SCHEMA_ACTION=validate docker compose up -d --wait
```

Para consultar logs e parar preservando os dados:

```sh
docker compose logs --tail 100 app db
docker compose down
```

Instruções adicionais: [ambiente Docker](ops/docker/README.md).

## Google Maps

No `.env`, configure `GOOGLE_MAPS_API_KEY` com uma chave de navegador de um projeto Google Cloud com faturamento e **Maps JavaScript API** habilitados. Restrinja a chave à API e aos referenciadores HTTP utilizados, por exemplo `http://localhost:18081/*`.

`GOOGLE_MAPS_MAP_ID=DEMO_MAP_ID` atende aos testes locais; use um map ID JavaScript próprio fora deles. Recrie o serviço após alterar as variáveis:

```sh
docker compose up -d --wait app
```

O mapa utiliza carregamento assíncrono, `importLibrary` e `AdvancedMarkerElement`. Sem chave, cadastro, lista e detalhes continuam disponíveis, com links para abrir as coordenadas no Google Maps. Consulte [configuração e testes do Maps](docs/docker/google-maps.md).

## Build e testes

Para compilar fora do Docker, configure `JAVA_HOME` para um JDK 25 e use Maven 3.9.11 ou superior:

```sh
mvn clean verify
```

O resultado é `target/geopin-1.0.0.war`. Para executar em outro Tomcat 11, configure a conexão PostgreSQL pelas propriedades JVM `db.url`, `db.username` e `db.password`; `db.schema-action` aceita `validate` para um esquema já inicializado.

Com a stack Docker ativa, execute o teste de integração HTTP e PostgreSQL (Python 3, sem pacotes adicionais):

```sh
python3 ops/docker/smoke.py
```

O smoke cobre criação, consulta, edição e exclusão de lugares, duas tags por local, UTF-8, JSON, preservação da data de criação e exclusão em cascata. Os registros do teste são removidos ao terminar. Para outra porta, forneça `GEOPIN_HTTP_PORT` também ao teste.

Os scripts `ops/docker/browser-ui.cjs`, `browser-css.cjs` e `browser-maps.cjs` utilizam Playwright/Chromium. A instalação e os comandos estão no [guia da interface](docs/docker/google-maps.md). Os testes de UI pressupõem chave Google vazia; o teste de Maps simula a API.

## Validação da migração

Foram aprovados build e testes JUnit, fluxos HTTP com PostgreSQL, interface desktop/celular, CSS, inicialização em banco vazio e retorno Java 25 → Java 21 → Java 25 em banco isolado. O PostgreSQL 16 foi preservado. A integração autenticada com Google Maps depende de uma chave real e não foi validada pela simulação.

Consulte [evidências, versões e recuperação](docs/java-upgrade/java25/README.md). Os relatórios Java 21 são históricos.

## Estrutura

- `src/main/java`: controllers, serviços, DAOs e entidades.
- `src/main/resources`: configuração Spring, persistência e logs.
- `src/main/webapp`: JSP, CSS e JavaScript.
- `src/test`: testes de contrato HTTP.
- `ops/docker`: instruções e regressões de integração/navegador.
- `docs`: decisões e evidências das atualizações.

## Nome do projeto

O repositório passou de `Trixlog-Spring` para [GeoPin](https://github.com/felipevmartins/GeoPin). As coordenadas Maven são `br.com.geopin:geopin` e os pacotes Java usam `br.com.geopin`.

O projeto Compose usa `geopin-test`, o banco/usuário `geopin`, o volume `geopin-test_postgres-test` e a imagem `geopin-app:local`. A nova base é inicializada vazia; os volumes antigos não são reutilizados. As variáveis `GEOPIN_HTTP_PORT` e `GEOPIN_SCHEMA_ACTION` têm prioridade; os nomes antigos com prefixo `TRIXLOG_` continuam aceitos. Relatórios históricos mantêm os nomes e caminhos observados na época.

Detalhes e validação da mudança de nome: [renomeação para GeoPin](docs/geopin.md).
