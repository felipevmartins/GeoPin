package br.com.geopin.web;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.cfg.DateTimeFeature;
import tools.jackson.databind.json.JsonMapper;

@Configuration
public class JsonConfiguration {
    @Bean
    public JsonMapper jsonMapper() {
        // Preserve the existing HTTP contract: java.util.Date is epoch milliseconds.
        return JsonMapper.builder()
                .enable(DateTimeFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();
    }
}
