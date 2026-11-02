> Registro histórico Java21. A validação atual com Java25 está em [java25/README.md](../java-upgrade/java25/README.md).

# Validação Docker — Java 21

Ambiente: Docker Engine 29.9.2, Linux amd64/WSL2. Compose `trixlog-test`, sem usar banco/volumes de outras aplicações.

| Verificação | Resultado |
| --- | --- |
| docker compose config --quiet | código 0 |
| docker compose build | código 0; Maven clean package sem ignorar testes |
| docker compose up -d --wait --wait-timeout 120 | código 0; app/db healthy |
| JVM no container app | Eclipse Temurin 21.0.13+9 LTS |
| Tomcat | 9.0.123, namespace javax.servlet |
| PostgreSQL | 16.15, driver JDBC 42.7.8; autenticação padrão SCRAM |
| python3 ops/docker/smoke.py | código 0; resultado em smoke.log |
| Logs finais | sem ERROR, SEVERE, Caused by ou InaccessibleObjectException |

O smoke validou JSP, criação/consulta/edição/exclusão de localização, associação/consulta de tag, exclusão em cascata, JSON e nomes com acentos. Conferiu persistência diretamente no PostgreSQL e removeu somente os registros criados pelo teste. Edição/exclusão usam POST com `_method`, conforme HiddenHttpMethodFilter já configurado na aplicação.

A primeira inicialização falhou por `NoClassDefFoundError: javax/xml/bind/JAXBException` no Hibernate Validator 5. Foi adicionada jaxb-api 2.3.1, preservando a linha javax. Corrigido o DTD Hibernate para a URL reconhecida pelo resolvedor interno. Configuração de usuário/senha passa a respeitar as propriedades existentes; Compose sobrescreve URL e credenciais com propriedades de JVM. Driver PostgreSQL legado substituído por org.postgresql:postgresql:42.7.8 para o banco atual. Nenhuma migração major de framework realizada.

Limitações: `mvn verify` ainda usa Jetty 6 legado e sua parada sem stopKey/stopPort; o gate Docker usa WAR no Tomcat e não passa por esse plugin. Não há testes JUnit no projeto. Mapas e recursos externos no navegador, carga, segurança da stack legada e Java 25 não foram validados. Imagens usam tags de linha e podem receber patches futuros; versões acima são as observadas nesta execução. Containers foram deixados ativos para testes locais.

Recuperação: `docker compose down` preserva o volume de teste. Remover este ambiente não altera banco externo; os dados foram produzidos somente no PostgreSQL da stack. As instruções de uso/limpeza estão em ../../ops/docker/README.md.

Atualização posterior da interface e integração Maps: consulte [google-maps.md](google-maps.md) e os logs browser-ui.log/browser-maps.log. A regressão HTTP + banco foi repetida e aprovada com a interface atual.
