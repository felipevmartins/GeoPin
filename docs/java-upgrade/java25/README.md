# Java 21 → 25 e atualização da stack

Escopo autorizado: Java 25 em build, runtime e bytecode; dependências estáveis atuais (sem RC/M/SNAPSHOT), incluindo majors. WAR/JSP e contratos HTTP preservados; sem Boot, Native Image ou mudanças de regras de negócio. Estado local: árvore original movida à raiz pelo usuário, preservada, sem commits. Inventário em local-state-before.txt.

## Checkpoints e critérios

| Etapa | Estado | Entrada → saída | Evidência/gate |
|---|---|---|---|
| A diagnóstico | completed | Java 21/release21 → diagnóstico Java25 sem edição | verify falha nos dois JDKs; zero testes; smoke/UI no Docker21 passam |
| B migração combinada | completed | Spring4/Hibernate4/javax → Spring7/Hibernate7/Jakarta/release25 | clean package de compilação, clean verify com testes, bytecode69 |
| B2 transitivas | completed | stack compilada/fluxos aprovados → últimas transitivas compatíveis | metadata, fontes, clean verify e novo Docker/smoke |
| C execução e recuperação | completed | WAR25 → Docker25 com PostgreSQL16 | smoke CRUD/tags/UTF8, navegador/CSS/Maps simulado, leitura de dados existentes, restore/retorno isolado |

Salto único LTS 21→25: não há LTS intermediária. Spring4 sem suporte desde 2020; atualização major explicitamente autorizada. Override de Javassist não resolve o suporte encerrado nem remove org.springframework.orm.hibernate4, removido no Spring5. Portanto não será adotado como estado final. Migração conjunta de imports específicos javax.persistence/javax.servlet, ORM e container é obrigatória pela compatibilidade Jakarta. APIs Hibernate Criteria legadas removidas serão substituídas por JPA. Nenhum add-opens adicionado pelo projeto. A imagem oficial Tomcat inclui suas próprias opções de abertura de módulos e native-access.

## Ambiente

| Item | Origem | Alvo |
|---|---|---|
| JDK build | Temurin21.0.13+9 | Temurin25.0.5+8 /home/felipe/.sdkman/candidates/java/25.0.5.0+8-tem |
| release | 21 (65) | 25 (69), parameters=true para Spring6.1+ |
| JVM/container | Tomcat9/Temurin21 | Tomcat11.0.27/Temurin25.0.5+8; digest no Dockerfile |
| Build | Maven3.10.0 host,3.9.11 Docker; sem wrapper | Maven3.10.0 host e builder; digest no Dockerfile |
| SO | Linux amd64 WSL2 | mesmo |
| Banco | PostgreSQL16 | preservar16: servidor não é dependência Java; JDBC atualizado, teste em volume isolado |

Baseline: mvn -B -ntp -fae clean verify no JDK21 e JDK25 (sem alteração) falham: Jetty6 stopKey/stopPort, CGLIB/Javassist reflexivo e conexão ao banco legado do config.properties. Sem testes Java existentes. Docker21 com configuração de teste passa smoke e browser-ui. Não declarar equivalência de suíte Java inexistente.

## Defasagem e fontes (2026-11-02)

| Componente | Projeto | Estável atual | Suporte/decisão | Fonte de versão |
|---|---|---|---|---|
| org.springframework:spring-framework-bom | 4.0.1.RELEASE | 7.0.10 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/springframework/spring-framework-bom/maven-metadata.xml |
| org.springframework.security:spring-security-bom | não fixado/indireto | 7.1.2 | removido: não utilizado pela aplicação | https://repo.maven.apache.org/maven2/org/springframework/security/spring-security-bom/maven-metadata.xml |
| org.hibernate.orm:hibernate-core | 4.3.1.Final | 7.4.14.Final | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/hibernate/orm/hibernate-core/maven-metadata.xml |
| org.hibernate.validator:hibernate-validator | 5.0.3.Final | 9.1.6.Final | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/hibernate/validator/hibernate-validator/maven-metadata.xml |
| tools.jackson.core:jackson-databind | Jackson 1.4.2 | 3.2.4 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/tools/jackson/core/jackson-databind/maven-metadata.xml |
| org.postgresql:postgresql | 42.7.8 | 42.7.14 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/postgresql/postgresql/maven-metadata.xml |
| commons-beanutils:commons-beanutils | 1.7.0 | 1.11.0 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/commons-beanutils/commons-beanutils/maven-metadata.xml |
| ch.qos.logback:logback-classic | 1.1.1 | 1.6.6 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/ch/qos/logback/logback-classic/maven-metadata.xml |
| org.slf4j:slf4j-api | 1.7.6 | 2.0.20 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/slf4j/slf4j-api/maven-metadata.xml |
| jakarta.servlet:jakarta.servlet-api | não fixado/indireto | 6.1.0 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/jakarta/servlet/jakarta.servlet-api/maven-metadata.xml |
| jakarta.servlet.jsp:jakarta.servlet.jsp-api | não fixado/indireto | 4.0.0 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/jakarta/servlet/jsp/jakarta.servlet.jsp-api/maven-metadata.xml |
| jakarta.servlet.jsp.jstl:jakarta.servlet.jsp.jstl-api | não fixado/indireto | 3.0.2 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/jakarta/servlet/jsp/jstl/jakarta.servlet.jsp.jstl-api/maven-metadata.xml |
| org.glassfish.web:jakarta.servlet.jsp.jstl | não fixado/indireto | 3.0.1 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/glassfish/web/jakarta.servlet.jsp.jstl/maven-metadata.xml |
| org.junit:junit-bom | JUnit 4.11 | 6.1.3 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/junit/junit-bom/maven-metadata.xml |
| org.seleniumhq.selenium:selenium-java | não fixado/indireto | 4.52.0 | removido: sem testes Selenium existentes | https://repo.maven.apache.org/maven2/org/seleniumhq/selenium/selenium-java/maven-metadata.xml |
| org.apache.maven.plugins:maven-compiler-plugin | 3.13.0 | 3.16.0 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-compiler-plugin/maven-metadata.xml |
| org.apache.maven.plugins:maven-resources-plugin | 2.6 | 3.5.0 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-resources-plugin/maven-metadata.xml |
| org.apache.maven.plugins:maven-surefire-plugin | 2.15 | 3.6.1 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-surefire-plugin/maven-metadata.xml |
| org.apache.maven.plugins:maven-failsafe-plugin | não fixado/indireto | 3.6.1 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-failsafe-plugin/maven-metadata.xml |
| org.apache.maven.plugins:maven-war-plugin | não fixado/indireto | 3.5.1 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-war-plugin/maven-metadata.xml |
| org.apache.maven.plugins:maven-clean-plugin | não fixado/indireto | 3.5.0 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-clean-plugin/maven-metadata.xml |
| org.apache.maven.plugins:maven-dependency-plugin | não fixado/indireto | 3.11.0 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-dependency-plugin/maven-metadata.xml |
| org.apache.maven.plugins:maven-enforcer-plugin | não fixado/indireto | 3.7.0 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-enforcer-plugin/maven-metadata.xml |
| org.apache.maven.plugins:maven-install-plugin | não fixado/indireto | 3.2.0 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-install-plugin/maven-metadata.xml |
| org.apache.maven.plugins:maven-deploy-plugin | não fixado/indireto | 3.2.0 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/apache/maven/plugins/maven-deploy-plugin/maven-metadata.xml |
| org.apache.tomcat:tomcat-catalina | 9.0 | 11.0.27 | estável publicada; uso conforme matriz Jakarta | https://repo.maven.apache.org/maven2/org/apache/tomcat/tomcat-catalina/maven-metadata.xml |

## Versão × página lida antes das edições

| Versão | Página/seção consultada | Decisão |
|---|---|---|
| Spring7.0.10 | https://raw.githubusercontent.com/wiki/spring-projects/spring-framework/Spring-Framework-Versions.md ; https://raw.githubusercontent.com/wiki/spring-projects/spring-framework/Spring-Framework-7.0-Release-Notes.md (baseline/removals/JPA/Jackson) | JDK17–25+, EE11, Jackson3, JPA3.2 |
| Spring5/6/6.1 | respectivas Spring-Framework-X-Release-Notes.md no mesmo wiki, seções baseline/ORM/parameter retention | remoção orm.hibernate4; imports Jakarta; parameters=true |
| Spring7 JPA | https://docs.spring.io/spring-framework/reference/data-access/orm/jpa.html (LocalContainerEntityManagerFactoryBean, JpaTransactionManager, injection) | bootstrap JPA e transações locais |
| Hibernate7.4.14 | https://raw.githubusercontent.com/hibernate/hibernate-orm/7.4/README.adoc ; migration-guide.adoc (API changes); POM Maven Central | JPA3.2, ORM atual |
| Hibernate6 | https://raw.githubusercontent.com/hibernate/hibernate-orm/6.0/migration-guide.adoc (Jakarta, sequences, legacy Criteria) | JPA typed queries; preservar nomes/incrementos de sequências |
| Validator9.1.6 | https://raw.githubusercontent.com/hibernate/hibernate-validator/9.1/README.md (requirements/setup) | Validation3.1; EL do Tomcat |
| Jackson3.2.4 | https://github.com/FasterXML/jackson/wiki/Jackson-Release-3.0 (packages/defaults) | tools.jackson; regressão JSON |
| Tomcat11.0.27 | https://tomcat.apache.org/whichversion.html (11.x row) | Servlet6.1/JSP4, Java17+ |
| Logback1.6.6 | https://logback.qos.ch/news.html (1.6 requirements/release) | SLF4J2/Java11+ |
| JDBC42.7.14 | https://jdbc.postgresql.org/documentation/setup/ | JDBC em Java25/PostgreSQL16 será validado |
| BeanUtils1.11.0 | https://commons.apache.org/proper/commons-beanutils/ | atualizar linha estável, 2.x apenas milestones |
| Compiler3.16.0 | https://maven.apache.org/plugins/maven-compiler-plugin/examples/set-compiler-release.html | release25 |
| JUnit6.1.3 | https://docs.junit.org/current/user-guide/ | JUnit atual com Surefire atual |
| JDK22–25 | https://docs.oracle.com/en/java/javase/25/migrate/significant-changes-jdk-22.html até -25.html | triagem locale/UTF8, Unsafe/native access, reflexão; sem preview |

Páginas hibernate.org/docs.hibernate.org retornaram403; fontes oficiais alternativas do próprio repositório Hibernate foram lidas. Wiki antigo de upgrade redireciona para release notes; não usado como prova.

## Componentes antigos e pins

JAXB javax2.3.1 era workaround do Validator5: remover dependência direta, Hibernate atual traz Jakarta JAXB. JCL-over-SLF4J será atualizado2.0.20 com exclusão de commons-logging para evitar classes duplicadas. Versões Spring geridas por BOM; sem Boot/Cloud. Security3, Selenium2, xml-apis e execução Jetty6 não são usados por código/configuração/testes: retirar artefatos inativos; testes browser Playwright existentes preservados. Jackson1 substituído por Jackson3 suportado no Spring7; Servlet/JSP/JSTL substituídos pelas APIs Jakarta correspondentes. Criteria/Restrictions e saveOrUpdate substituídos por EntityManager/find/merge/queries. Nenhuma configuração de autenticação existe a preservar.

## Recuperação preparada

Imagem anterior trixlog-test-app:java21-before-java25; fonte/configuração e pg_dump custom em /tmp/trixlog-java25-recovery. Volume original será preservado; testes de ida/volta usarão novo projeto Compose e restore do dump em PostgreSQL16. Não rebaixar formato de banco nem apagar volumes. Incompatibilidade de sequência/DDL é gate: comparar esquema e validar leitura/escrita no retorno. Backup local temporário, copiar para local durável se necessário.

### Resultado B e próximo gate B2

Compilação25 e verify25 aprovados, dois testes JUnit6 sem falhas/skips e bytecode69 em todas as classes. Docker25 iniciou com schema-action=validate sobre restore PostgreSQL16 do Java21; dado e tag anteriores lidos com JSON exatamente igual. Primeiro smoke detectou HTML vazio200 por ShallowEtagHeaderFilter em forward JSP Servlet6.1: comprovado por restringir o filtro a JSON/assets e observar HTML completo novamente. Imagem Tomcat11 não traz curl: instalado explicitamente para o healthcheck existente. Fluxos HTTP/UI repetidos e aprovados após correção.

B2: auditoria de todas as transitivas em /tmp/trixlog-transitive-audit.json; alinhar SLF4J por BOM, Micrometer por BOM, JAXB por BOM e APIs EL fornecidas pelo Tomcat, além dos patches compatíveis. Cada override tem motivo: pedido explícito de máximas versões estáveis e gate de runtime/CRUD. ANTLR precisa acompanhar a versão usada para gerar os parsers do Hibernate; não atualizar isoladamente. Commons Collections3.2.2 permanece: a entrada20040616 do metadata é histórica, anterior a3.2.2; linha4 tem pacote/API diferente.

Gate B: smoke-fixed e ui-fixed aprovados em /tmp/trixlog-java25-*.log. Persistência usa merge também para entidades novas com pais existentes detached, preservando o grafo aceito pelo saveOrUpdate anterior. B2 usa BOMs SLF4J2.0.20/Micrometer1.17.2/JAXB4.0.9; overrides JBoss Logging3.6.3, Models1.3.4, ByteBuddy1.18.17, Classmate1.8.0, checker-qual4.3.1. istack4.1.2 permanece na versão do JAXB BOM4.0.9: o próprio BOM exclui4.2+ de atualização. EL6.0.1 provided evita API5 duplicada no WAR. Fontes adicionais oficiais lidas: GitHub micrometer-metrics/micrometer README, hibernate/hibernate-models README, raphw/byte-buddy README (Java25+), FasterXML/java-classmate README (1.7+Java8), jboss-logging/jboss-logging README; especificação Jakarta EL6; manual Checker Framework (anotações); JAXB BOM4.0.9 publicado. Compatibilidade binária dos overrides será verificada no contexto real.

## Resultado final

- Build e runtime Temurin25.0.5+8; release25/bytecode69: 13 classes e 2 classes de teste. Maven3.10.0/Tomcat11.0.27 fixados por digest. IntelliJ alinhado a JDK25 (cadastrar SDK25 na IDE).
- `clean package -DskipTests` aprovado apenas como gate de compilação; `clean verify` aprovado com 2 testes JUnit6, zero falhas/erros/skips. Relatórios coletados após clean; `tests-comparison.json` registra baseline0 → final2, sem testes removidos. Não havia suíte Java anterior para provar equivalência: baseline Docker21 e regressão HTTP/navegador são evidências complementares.
- `smoke-final.log`, `browser-ui-final.log`, `browser-css-final.log`, `browser-maps-final.log`: aprovados com a stack final e banco restaurado. Smoke inclui duas tags no mesmo local, data em epoch preservada na edição e exclusão em cascata. `smoke-local.log`/`browser-ui-local.log`: aprovados na porta18081.
- `rollback-rehearsal.log`: restore do dump Java21 em volume isolado, leitura de registros/tags/JSON anteriores, criação no Java25, retorno à imagem21, CRUD21 e retorno25 com os mesmos dados aprovados. `schema-comparison.txt`: DDL igual, ignorando somente cabeçalhos e tokens aleatórios do pg_dump. Nenhuma migration destrutiva.
- `jdeps.txt` (jdk-internals) e `jdeprscan.txt` sobre classes da aplicação e classpath, incluindo Servlet provided: sem referências internas/depreciações encontradas. Triagem estática não cobre reflexão ou código externo completo.
- `dependencies-final.txt`: árvore efetiva; `transitive-audit.json`: versões consultadas antes dos overrides. Últimas estáveis compatíveis identificadas na consulta2026-11-02; sem versões preliminares. istack4.1.2 permanece alinhado ao JAXB BOM4.0.9, cuja regra de atualização exclui4.2+; Commons Collections3.2.2/ANTLR4.13.2 permanecem pelas razões acima.
- Serviços locais healthy em http://localhost:18081/, executando a imagem validada com `schema-action=validate`. O Compose continua com padrão update para bancos locais vazios. PostgreSQL16 preservado. Chave Google ausente: teste Maps usa simulação e não comprova credenciais/tiles reais.

Aviso observado: namespace XML MVC depreciado no Spring7, ainda funcional. Não foi necessária conversão incidental de toda configuração para Java. Problemas encontrados e corrigidos nos testes reais: corpo JSP vazio pelo filtro ETag e persistência de tag com pai detached. O cleanup do teste de navegador também passou a evitar uma segunda exclusão do registro já removido; a execução local final não apresentou exceções de aplicação.

### Operação e recuperação local

`docker compose up -d --build --wait` reconstrói e inicia a versão25; `python3 ops/docker/smoke.py` valida a stack. Build host requer JAVA_HOME25 e Maven3.9.11+; usar o wrapper de logs conforme AGENTS.md. O Docker dispensa JDK/Maven no host. Veja [ambiente Docker](../../../ops/docker/README.md).

Imagem anterior preservada: `trixlog-test-app:java21-before-java25`; imagem final validada: `trixlog-java25-app:validated`. Para retorno local, criar override Compose:

```yaml
services:
  app:
    image: trixlog-test-app:java21-before-java25
```

Aplicar com `docker compose -f compose.yaml -f CAMINHO_DO_OVERRIDE up -d --no-build --wait app`, preservando o projeto/porta/variáveis de ambiente. Para voltar à25, trocar image por `trixlog-java25-app:validated`. Não usar `down --volumes`. O ensaio foi executado no projeto `trixlog-java25`, porta18082; esse projeto é parado ao concluir, com volume mantido.

Backups locais temporários em `/tmp/trixlog-java25-recovery`: fonte21 (`source-java21.tar.gz`), dumps21 e `database-before-local-java25.dump` imediatamente antes da troca na porta18081. O ensaio restaurou `preserved-java21.dump` via `pg_restore -U trixlog -d trixlog` em banco isolado vazio. Backups/imagens não são retenção durável nem autorização para restaurar sobre banco compartilhado. Nenhum commit/push executado.

Inicialização do zero também aprovada: projeto isolado `trixlog-java25-empty`, porta18083, volume novo PostgreSQL16, schema-action=update, app/db healthy e `smoke-empty-database.log` aprovado. Projetos isolados parados ao final, volumes mantidos; somente a stack local original permanece ativa na porta18081.
