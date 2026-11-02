> Estado atual: [migração para Java 25 e dependências](java25/README.md). O conteúdo abaixo registra a etapa anterior para Java 21.

# Atualização Java

Alvo autorizado: Java 21, seguido posteriormente por Java 25 LTS. Sem commits, push ou implantação.

## Estado e critérios

| Etapa | Estado | Entrada → saída | Evidência |
| --- | --- | --- | --- |
| Diagnóstico | concluído | Java 7 configurado / JDK 8 → avaliação JDK 21 | baseline-java8.log e diagnosis-java21.log |
| Compilação Java 21 | concluída | compiler 2.5/source-target 7 → compiler 3.13.0/release 21 | empacotar WAR e confirmar major 65 |
| Execução Java 21 | bloqueada | verificar contexto Spring, persistência e HTTP | exigir inicialização e fluxo real em banco isolado |
| Java 25 | pendente | depende da validação Java 21 | diagnóstico específico posterior |

Ambiente: Linux amd64/WSL2, Maven 3.10.0, Temurin 8.0.504+1 e 21.0.13+9 instalados em `/home/felipe/.sdkman/candidates/java`. Sem Maven Wrapper. Bytecode original 7, IDE 21, JVM de produção desconhecida. O repositório Maven local é do usuário. O checkout já contém a movimentação de `trixlog-spring/` para a raiz; preservada.

Baseline: `mvn -B -ntp -fae clean verify` no JDK 8 compilou, não encontrou testes, falhou no contexto Hibernate (XML inválido) e em jetty:stop (stopKey/stopPort ausentes). No JDK 21 sem alterações falhou em source/target 7. As execuções foram encapsuladas em codex-java-build. Não há evidência de equivalência funcional.

Plano mínimo: atualizar apenas compilador/release e diagnosticar execução antes de migrar frameworks. Saltos 7→8→11→17→21 combinados na compilação pois o primeiro bloqueio observado é source/target 7; investigar módulos removidos, reflexão/encapsulamento e charset no gate de execução. Não foi criado checkpoint de implantação em LTS intermediária. Spring Boot/Cloud e imagens não são usados. Spring 4.0.1, Security 3.2, Hibernate 4.3.1/Validator 5.0.3 e Jetty 6 permanecem nesta etapa; não representam stack atualizada. Todas as versões explícitas já existentes no POM são pins históricos, sem justificativa registrada. Compiler 3.13.0 é o único novo pin, para suportar release.

## Fontes consultadas

| Versão | Página lida | Decisão |
| --- | --- | --- |
| Compiler 3.13.0 | https://maven.apache.org/plugins/maven-compiler-plugin/examples/set-compiler-release.html | usar maven.compiler.release para linguagem, APIs e bytecode 21 |
| Spring 4.0.1 | https://docs.spring.io/spring-framework/docs/4.0.1.RELEASE/spring-framework-reference/html/new-in-4.0.html | documentação anuncia suporte a Java 8, não comprova Java 21 |
| Spring 5.3/6.2/7 | https://github.com/spring-projects/spring-framework/wiki/Spring-Framework-Versions | 5.3 cobre JDK 21/javax; 6.2/7 cobrem JDK 25/Jakarta; avaliar migração separadamente se necessária |

O scan_stack.py --root . --latest foi executado; somente reportou namespaces javax e não produziu inventário de versões para este POM sem parent. Atualidade das demais dependências não comprovada. Não executar substituição global javax→jakarta.

## Recuperação

Restaurar somente a propriedade e o bloco do compiler plugin conforme backup `pom-before-java21.xml`, sem desfazer a reorganização local. Usar artefato anterior com seu JDK/servidor anterior. Nenhuma alteração de dados autorizada ou realizada; hibernate.hbm2ddl.auto=update impede ensaio seguro contra banco compartilhado. Rollback operacional não ensaiado. A versão do PostgreSQL servidor ainda é desconhecida; não se declara compatibilidade do driver legado com servidor/Java 21.

## Resultado do gate Java 21

`mvn -B -ntp -fae clean verify` com Temurin 21.0.13+9 compilou os 11 fontes com release 21, executou as fases de teste (nenhum teste encontrado) e empacotou o WAR. A inicialização do contexto continuou falhando no XML Hibernate, e verify terminou com código 1 por stopKey/stopPort ausentes no Jetty, como no baseline. Log: verify-java21.log. `javap -verbose target/classes/br/com/trixlog/model/Tag.class` confirmou major version 65. Sem declaração de compatibilidade funcional ou de suporte do Spring 4 no Java 21. Stack permanece legada. Java 25 não iniciado.

Comando de reprodução sem mudar o JDK global:

```sh
JAVA_HOME=/home/felipe/.sdkman/candidates/java/21.0.13.0+9-tem /home/felipe/.codex/bin/codex-java-build -- mvn -B -ntp -fae clean verify
```

Próxima etapa: corrigir o XML Hibernate e configuração de parada do servidor, montar um PostgreSQL descartável compatível com o driver e testar contexto/CRUD sem acessar dados compartilhados. Reavaliar frameworks conforme os bloqueios observados e a matriz oficial. Nenhum framework atualizado nesta alteração.

Gate de empacotamento: `mvn -B -ntp -fae clean package` no JDK 21 terminou com código 0 e gerou `target/trixlog-1.0.0.war`, sem ignorar testes (nenhum existente). Evidência: package-java21.log. Compilação/empacotamento aprovados; execução e equivalência funcional pendentes.

## Validação posterior em containers

A tarefa Docker posterior corrigiu o DTD Hibernate e forneceu PostgreSQL 16 isolado, com driver 42.7.8 e jaxb-api 2.3.1 para o erro comprovado de JAXB ausente. A aplicação iniciou em Tomcat 9/Temurin 21.0.13+9; o smoke HTTP + PostgreSQL validou CRUD de localização, tags, JSON e UTF-8. Evidências: ../docker/validation.md e ../docker/smoke.log. Isso fecha o gate funcional dos cenários descritos no ambiente Docker; a configuração antiga de `mvn verify`/Jetty continua pendente. A stack Spring/Hibernate permanece legada; Java 25 não foi iniciado.
