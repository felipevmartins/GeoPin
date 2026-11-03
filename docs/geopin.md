# Renomeação para GeoPin

Em 2026-11-03, o repositório foi renomeado de Trixlog-Spring para GeoPin, mantendo a branch padrão main e o histórico Git. Novo endereço: https://github.com/felipevmartins/GeoPin.

A interface, o README, o artefato Maven (`br.com.geopin:geopin`), os pacotes Java, os scans Spring/JPA e o callback da API Maps foram atualizados juntos. O WAR é `geopin-1.0.0.war`.

Por decisão do usuário, os dados anteriores não precisam ser migrados. A nova stack usa projeto Compose `geopin-test`, banco/usuário `geopin`, volume `geopin-test_postgres-test` e imagem `geopin-app:local`. Volumes antigos não são reutilizados. Variáveis GEOPIN_HTTP_PORT e GEOPIN_SCHEMA_ACTION têm prioridade sobre os aliases TRIXLOG_HTTP_PORT e TRIXLOG_SCHEMA_ACTION.

Validação: Maven clean verify no JDK25 aprovado (2 testes, sem falhas/erros/skips), build Docker com clean verify aprovado, inicialização em banco vazio, confirmação SQL `geopin|geopin`, smoke HTTP/PostgreSQL e suites Chromium UI/CSS/Maps simulada aprovadas. Título, marca e rodapé GeoPin conferidos por HTTP. Logs de runtime sem exceções de aplicação; permanece o aviso conhecido sobre configuração XML MVC depreciada.

Os testes foram executados no projeto isolado geopin-rename-check, porta18084. Containers, rede, volume descartável e imagem da aplicação usados nesse teste foram removidos ao concluir. Logs locais em /tmp/geopin-rename-*.log e log Maven em /home/felipe/.codex/logs/java-build/build-CzS8RhhN.log; arquivos temporários não são retenção durável. Relatórios históricos Java21/25 preservam seus nomes originais. A API Maps simulada não valida credenciais Google ou tiles reais.
