# Ambiente Docker de teste

Pré-requisitos: Docker Engine com Compose v2. O build ocorre em uma imagem Maven com JDK 25; não precisa de Maven/Java no host.

Na raiz do projeto:

```sh
docker compose up -d --build --wait --wait-timeout 180
```

Abra http://localhost:18081/. Para usar outra porta, prefixe o comando com `TRIXLOG_HTTP_PORT=18082` (use a mesma variável no smoke).

Serviços: Tomcat 11 com Temurin 25, com APIs Jakarta EE 11, e PostgreSQL 16. O banco só é acessível na rede Compose, com volume exclusivo `trixlog-test_postgres-test`. A aplicação é publicada apenas em 127.0.0.1. Credenciais fixas são exclusivas deste ambiente local. Hibernate cria/atualiza o esquema neste banco de testes.

Teste de integração (Python 3 no host, sem dependências):

```sh
python3 ops/docker/smoke.py
```

O teste acessa páginas JSP e executa criação, consulta JSON, edição e exclusão de localização, incluindo tag, UTF-8 e confirmação direta no PostgreSQL. Usa nome único e remove seus registros ao terminar. Execute somente contra esta stack local.

Diagnóstico e parada, preservando o banco:

```sh
docker compose ps
docker compose logs --tail 100 app db
docker compose down
```

Para apagar **todos os dados de teste** e recriar o banco do zero, execute `docker compose down --volumes` e depois o comando de inicialização. Isso remove apenas os volumes desta stack.

A construção executa `mvn clean verify`, incluindo os testes JUnit 6. O smoke testa HTTP e PostgreSQL reais; os scripts `browser-ui.cjs`, `browser-css.cjs` e `browser-maps.cjs` verificam a interface com Playwright (instale Playwright e Chromium no ambiente de execução). O teste de Maps simula a API; a integração com o serviço Google exige uma chave válida.

A migração, versões exatas, fontes, evidências e recuperação estão em [Java 25](../../docs/java-upgrade/java25/README.md). Para testar somente a compatibilidade de um banco já existente, use `TRIXLOG_SCHEMA_ACTION=validate`; o padrão `update` permite inicializar o banco local vazio.

## Interface e Google Maps

A interface foi renovada para desktop/celular. Para configurar a chave Google Maps no Docker e executar os testes de navegador, consulte [Google Maps e interface](../../docs/docker/google-maps.md). Sem a chave, cadastro e consulta de lugares continuam disponíveis.
