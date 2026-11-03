FROM maven:3.10.0-eclipse-temurin-25@sha256:9d329e21adce7c0cc53f2fd21e73c127a247c73287b8503196136ec5cff52328 AS build
WORKDIR /workspace
COPY pom.xml .
COPY src ./src
RUN mvn -B -ntp clean verify

FROM tomcat:11.0.27-jdk25-temurin@sha256:8f0edc859bdcd6c34faeaf863bc99fa31ced7e31f26efbb6d94a7027cefd7b36
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* /usr/local/tomcat/webapps/*
COPY --from=build /workspace/target/geopin-1.0.0.war /usr/local/tomcat/webapps/ROOT.war
EXPOSE 8080
CMD ["catalina.sh", "run"]
